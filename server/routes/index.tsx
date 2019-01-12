import express from "express"
import mongoose from "mongoose"
const router = express.Router()

import React from "react"
import ReactDOMServer from "react-dom/server"
import { StaticRouter } from "react-router"
import { Provider } from "react-redux"

import { createStore, combineReducers, applyMiddleware, bindActionCreators } from "redux"
import fs from "fs"
import path from "path"

// const { App, reducers } = require("../../whiplash/build/app.bundle")

// const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../whiplash/build/manifest.json")).toString())
// const bundle_js = manifest["app.js"]

// const context = {}

// const handleRender = (req: Request, res) => {
//     // Create a new Redux store instance
//     const store = createStore(reducers, {
//         posts: [{ a: "shit" }]
//     })

//     // Render the component to a string
//     const html = ReactDOMServer.renderToString(
//         <StaticRouter location={req.url} context={context}>
//             <App store={store} />
//         </StaticRouter>
//     )

//     // Grab the initial state from our Redux store
//     const preloadedState = JSON.stringify(store.getState())

//     // console.log(html)
//     // console.log(preloadedState)
//     // Send the rendered page back to the client
//     // res.send(renderFullPage(html, preloadedState))
//     res.render("home_react.html", { preloadedState, bundle_js, html })
// }

// router.get("/", async (req, res, next) => {
//     return handleRender(req, res)
//     // const q = ScheduleTask.findOne({ title: "Shopping"})
//     // // q.then((task) => {
//     // //   res.render('index', { title: task.title });
//     // // }).catch((err) =>{
//     // //   // logger.error(err);
//     // //   res.status(422).send(err.errors);
//     // // })
//     // try{
//     //   let task = await q.lean()
//     //   return res.json(task)

//     // }
//     // catch (err) {
//     //   return res.status(422).send(err.errors);
//     // }
// })

export default router
