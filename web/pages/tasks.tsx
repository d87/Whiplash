import React from "react"
import { Layout } from "../src/components/Layout/Layout"
import App, { TaskList } from "../src/components/Tasks/TaskList"
// import { withApollo } from "react-apollo";
import { BrowserRouter, Router } from "react-router-dom"
import { getTasks } from "../src/api/api"

const Tasks = props => {
    return (
        <Layout>
            <App />
        </Layout>
    )
}

Tasks.getInitialProps = async pageContext => {
    const response = await getTasks()

    const { req, res, store, isServer } = pageContext
    store.dispatch({
        type: "TASK_INIT",
        newState: response.data.tasks
    })

    return {
    }
}

export default Tasks
