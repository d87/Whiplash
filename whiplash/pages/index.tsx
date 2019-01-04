import React from "react"
import App from "../src/components/App/App"
import {Layout}  from "../src/components/Layout/Layout"
// import { withApollo } from "react-apollo";
import { BrowserRouter, Router } from "react-router-dom"
import { history } from "../src/history"
import { getTasks, subscribeToResets } from '../src/api/api'

class Index extends React.Component {
    // static async getInitialProps(pageContext) {
    //     const { req, res, store, isServer } = pageContext
    //     // console.log(Object.keys(pageContext))

    //     return { }
    // }

    render() {
        return (            
            <Layout>
                <App />
            </Layout>
        )
    }
}

export default Index
