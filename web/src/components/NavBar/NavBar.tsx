import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
// import {  Link } from 'react-router-dom'
import Link from "next/link"
import { history } from "../../history"
import "./NavBar.scss"
import { UserBadge } from "../UserBadge/UserBadge";

class NavBar extends React.Component {
    render() {
        return (
            <header>
                <h2>Whiplash</h2>
                <input type="checkbox" id="nav-toggle" className="nav-toggle" />
                <nav>
                    <ul>
                        <Link href="/activity">
                            <li>Activity</li>
                        </Link>
                        <Link href="/tasks">
                            <li>Tasks</li>
                        </Link>
                        <Link href="/timers">
                            <li>Timers</li>
                        </Link>
                        <Link href="/login">
                            <li>Login</li>
                        </Link>
                    </ul>
                </nav>
                <label htmlFor="nav-toggle" className="nav-toggle-label">
                    <span className="material-icons iconOn largeText">menu</span>
                </label>
                <UserBadge/>
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
