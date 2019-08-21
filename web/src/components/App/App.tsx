import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Provider } from 'react-redux'
import "./global.scss"
import { Route, Link, Redirect  } from "react-router-dom"
import NavBar from "../NavBar/NavBar"
import TaskList from "../Tasks/TaskList"
import TimerApp from "../TimerApp/TimerApp"

export const App = (props) => {
    return (
        <Provider store={props.store}>
            <NavBar />
            <div className="container App ">
                <Route path="/" render={() => {
                    return <Redirect to='/tasks'/>
                }} />
                <Route path="/tasks" render={() => {
                    return <TaskList/>
                }} />
                {/* <Route path="/login" component={LoginPage} /> */}
                <Route path="/timers" component={TimerApp} />
            </div>
        </Provider>
    )
}

export default App
