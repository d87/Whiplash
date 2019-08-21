const proxyMiddleware = require('http-proxy-middleware')
const Bundler = require('parcel-bundler')
const express = require('express')

const port = parseInt(process.env.PORT, 10) || 4500
const env = process.env.NODE_ENV
const dev = env !== "production"

// https://parceljs.org/api.html
// watch: true, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
let bundler = new Bundler('pages/index.html')
let app = express()

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

if (dev && devProxy) {
    Object.keys(devProxy).forEach(context => {
        app.use(proxyMiddleware(context, devProxy[context]))
    })
}

app.use(bundler.middleware())

app.listen(port)
