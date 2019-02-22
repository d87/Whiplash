import React, { Component } from "react"
import ReactDOM from "react-dom"

import TaskList from "../Tasks/TaskList"

export const App = (props) => {
    return (
        // <Provider store={this.props.store}>
            // <ApolloProvider client={client}> 
                <TaskList/>
            // </ApolloProvider>
        // </Provider>
    )
}

export default App
