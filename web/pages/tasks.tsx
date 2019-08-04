import React from "react"
import { Layout } from "../src/components/Layout/Layout"
import App, { TaskList } from "../src/components/Tasks/TaskList"
import { getTasks, getCurrentUserProfile } from "../src/api/api"
import { authLoginSuccess } from "../src/auth/authActions"

const Tasks = props => {
    return (
        <Layout>
            <App />
        </Layout>
    )
}

Tasks.getInitialProps = async pageContext => {
    try {
        const { req, res, store, isServer } = pageContext

        const userResponse = await getCurrentUserProfile()
        if (!userResponse.data.user_profile.username) return {}

        store.dispatch(authLoginSuccess(userResponse.data.user_profile))

        const response = await getTasks()
        store.dispatch({
            type: "TASK_INIT",
            newState: response.data.tasks
        })
        return {}
    } catch(err) {
        console.error(err)
    }

    return {
    }
}

export default Tasks
