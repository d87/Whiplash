import React from "react"
import App from "../src/components/App/App"
import { Layout } from "../src/components/Layout/Layout"
import LoginPage from "../src/components/LoginPage/LoginPage"

class Index extends React.Component {
    static async getInitialProps(pageContext) {
        const { req, res, store, isServer } = pageContext
    }

    render() {
        return (
            <Layout>
                <LoginPage />
            </Layout>
        )
    }
}

export default Index
