import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import {  Link } from 'react-router-dom'
import { history } from "../../history"

import './NavBar.scss'

class NavBar extends React.Component {
    render() {
        return (
            <header>
                <h2 >Whiplash</h2>
                <input type="checkbox" id="nav-toggle" className="nav-toggle"></input>
                <nav>
                    <ul>
                        <li>
                            <Link to="/activity">Activity</Link>
                        </li>
                        <li>
                            <Link to="/tasks">Tasks</Link>
                        </li>
                        <li>
                            <Link to="/timers">Timers</Link>
                        </li>
                        <li>
                            <Link to="/todo">Todos</Link>
                        </li>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                    </ul>
                </nav>
                <label htmlFor="nav-toggle" className="nav-toggle-label">
                    <span className="material-icons iconOn largeText">menu</span>
                </label>
            </header>
        )
    }
}

// Connecting

const mapStateToProps = (state, props) => {
    return {
        timers: state.timers.list
    }
}

const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}

// export default connect(
// mapStateToProps,
// mapDispatchToProps
// )(LoginButton)
export default NavBar
