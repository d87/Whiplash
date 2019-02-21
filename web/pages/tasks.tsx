import React from "react"
import { Layout } from "../src/components/Layout/Layout"
import App from "../src/components/App/App"
// import { withApollo } from "react-apollo";
import { BrowserRouter, Router } from "react-router-dom"

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
