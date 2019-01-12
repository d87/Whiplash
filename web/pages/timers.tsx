import React from "react"
import App from "../src/components/App/App"
import { Layout } from "../src/components/Layout/Layout"
import TimerApp from "../src/components/TimerApp/TimerApp"

export default () => {
    return (
        <Layout>
            <TimerApp />
        </Layout>
    )
}
