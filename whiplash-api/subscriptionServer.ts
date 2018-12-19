import { createServer } from "http"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { execute, subscribe } from "graphql"
import { schema } from "./schema"
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { logger } from './logger'

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

    return SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
        },
        {
            server: websocketServer,
            path: "/api/subscriptions"
        }
    )
}