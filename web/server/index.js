// import { createServer } from "http";
const express = require("express")
const next = require("next")
const proxyMiddleware = require("http-proxy-middleware")

const devProxy = {
    "/api": {
        target: "http://nevihta.d87:3000",
        // pathRewrite: {'^/api': '/'},
        changeOrigin: true
    },
    "/users": {
        target: "http://nevihta.d87:3000",
        // pathRewrite: {'^/api': '/'},
        changeOrigin: true
    }
}

const port = parseInt(process.env.PORT, 10) || 4500
const env = process.env.NODE_ENV
const dev = env !== "production"
// ts-ignore
const options = { dev: dev }
const nextServer = next(options)
const handle = nextServer.getRequestHandler()

// let server
nextServer.prepare()
    .then(() => {
        const app = express()

        // Set up the proxy.
        if (dev && devProxy) {
            Object.keys(devProxy).forEach(context => {
                app.use(proxyMiddleware(context, devProxy[context]))
            })
        }

        // Default catch-all handler to allow Next.js to handle all other routes
        app.all("*", (req, res) => handle(req, res))

        const server = app.listen(port, err => {
            if (err) {
                throw err
            }
            console.log(`> Ready on port ${port} [${env}]`)
        })

        if (dev) {
            server.on("upgrade", handle)
        }
    })
    .catch(err => {
        console.log("An error occurred, unable to start the server")
        console.log(err)
    })
