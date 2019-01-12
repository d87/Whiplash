import fs from "fs"
import http from "http"
import app from "./app"
import { startSubscriptionServer } from './subscriptionServer'
import { logger } from './logger'
// import createDebug from 'debug'
// const debug = createDebug('whiplash-api:server')

const normalizePort = (portStr: string) => parseInt(portStr, 10)
const port = normalizePort(process.env.PORT || "3000")

// const credentials = {
//     key: fs.readFileSync('sslcert/server.key'),
//     cert: fs.readFileSync('sslcert/server.crt')
// };

function onError(error) {
    if (error.syscall !== "listen") {
        throw error
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            logger.error(bind + " requires elevated privileges")
            process.exit(1)
            break
        case "EADDRINUSE":
            logger.error(bind + " is already in use")
            process.exit(1)
            break
        default:
            throw error
    }
}

function onListening() {
    const addr = server.address()
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port
    logger.info("Listening on " + bind)
}

const server = http.createServer(app)

server.listen(port)
server.on("error", onError)
server.on("listening", onListening)
const subsServer = startSubscriptionServer(port+1)

