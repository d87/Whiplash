import { createServer } from "http"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { execute, subscribe } from "graphql"
import { schema } from "./schema"
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { logger } from './logger'
import { sessionParser } from './app'

export const pubsub = new RedisPubSub();

const WS_PORT = 3001

export const startSubscriptionServer = () => {
    // Create WebSocket listener server
    const websocketServer = createServer((request, response) => {
        response.writeHead(404)
        response.end()
    })

    // Bind it to port and start listening
    websocketServer.listen(WS_PORT)
    websocketServer.on("listening", () => {
        logger.info(`Websocket Server is now running on http://localhost:${WS_PORT}`)
    })

    return new SubscriptionServer(
        {
            schema,
            execute,
            subscribe,
            // JWT example: https://www.apollographql.com/docs/graphql-subscriptions/authentication.html

            onConnect: (connectionParams, webSocket, connectionContext) => {
                if (connectionContext.request.session.passport.user) {
                    // this object will be available as context in the sub resolvers now
                    return {
                        userID: connectionContext.request.session.passport.user
                    }
                }
                // logger.debug(connectionContext.request.session)
                throw new Error('Unauthorized!');
            }
        },
        {
            server: websocketServer,
            path: "/api/subscriptions",
            verifyClient: (info, done) => {
                // logger.debug('Parsing session from request...')
                sessionParser(info.req, {}, () => {
                    logger.debug('Session is parsed!', info.req.session)
                    done(info.req.session)
                })
            },
        }
    )
}