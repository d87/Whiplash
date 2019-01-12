import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import './LoginPage.scss'

import { authLogin } from '../../auth/authActions'


interface ILoginProps {
    dispatch: Dispatch
}

interface ILoginState {
    username: string
    password: string
    submitted: boolean
}

class LoginForm extends React.Component<ILoginProps, ILoginState> {
    constructor(props) {
        super(props);

        // reset login status
        // this.props.dispatch(userActions.logout());

        this.state = {
            username: '',
            password: '',
            submitted: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const { name, value } = e.target;
        const stateUpdate = {}
        stateUpdate[name] = value
        this.setState(stateUpdate)
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({ submitted: true });
        const { username, password } = this.state;
        const { dispatch } = this.props;
        if (username && password) {
            dispatch(authLogin(username, password))
        }
    }

    render() {
        // const { text, ...props } = this.props
        // const { showCounter, count } = props
        // const { loggingIn } = this.props;
        const { username, password, submitted } = this.state;


        return (
            <form name="form" method="post" action="/users/login" onSubmit={this.handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" placeholder="Username" name="username" value={username} onChange={this.handleChange} />
                    {/* {submitted && !username &&
                        <div className="help-block">Username is required</div>
                    } */}
                </div>
                <div>
                    <label htmlFor="password">Username</label>
                    <input type="password" placeholder="Password" name="password" value={password} onChange={this.handleChange} />
                </div>
                <div>
                    <input type="submit" value="Submit"></input>
                    {/* {loggingIn &&
                        <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    } */}
                </div>
            </form>
        )
    }
}



// Connecting

const mapStateToProps = (state, props) => {
    return {
        timers: state.timers.list
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,

        onDurationChanged: (timerID, newDuration) => {
            dispatch(timerSetDuration(timerID, newDuration))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
