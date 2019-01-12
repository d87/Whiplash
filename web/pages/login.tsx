import React from "react"
import App from "../src/components/App/App"
import { Layout } from "../src/components/Layout/Layout"
import LoginPage from "../src/components/LoginPage/LoginPage"

export default () => {
    return (
        <Layout>
            <LoginPage />
        </Layout>
    )
}
