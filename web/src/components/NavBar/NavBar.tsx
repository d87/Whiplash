import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { Link } from 'react-router-dom'
// import Link from "next/link"
import { history } from "../../history"
import "./NavBar.scss"
import { UserBadge } from "../UserBadge/UserBadge";

class NavBar extends React.Component {
    render() {
        return (
            <header className="navbar">
                <nav>
                    <Link to="/tasks">Tasks</Link>
                    <Link to="/timers">Timers</Link>
                    <Link to="/login">Login</Link>
                    <a style={{float: "right"}}>
                        <UserBadge/>
                    </a>
                </nav>
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
