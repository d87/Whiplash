import React, { Component } from "react"
import ReactDOM from "react-dom"
import { Provider as ReduxProvider } from 'react-redux'
import { overmind } from "../../overmind"
import { Provider } from 'overmind-react';
import "./global.scss"
import "./layout.scss"
import { Route, Link, Redirect  } from "react-router-dom"
import NavBar from "../NavBar/NavBar"
import TaskList from "../Tasks/TaskList"
import TimerApp from "../TimerApp/TimerApp"
import LoginForm from "../LoginPage/LoginPage"

export const App = (props) => {
    return (
        <Provider value={overmind}>
            <div className="page">
                {/* <NavBar /> */}
                <div className="content App">
                    <Route path="/" render={() => {
                        return <Redirect to='/tasks'/>
                    }} />
                    <Route path="/tasks" render={() => {
                        return <TaskList/>
                    }} />
                    <Route path="/login" component={LoginForm} />
                    <Route path="/timers" component={TimerApp} />
                </div>
            </div>
        </Provider>
    )
}

export default App
