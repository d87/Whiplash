import { loginSession as login, logoutSession as logout, getUser, } from './auth'
import { history } from '../history'


const LOGIN_REQUEST = "AUTH_LOGIN_REQUEST"
const LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS"
const LOGIN_FAILED = "AUTH_LOGIN_FAILED"
const LOGOUT = "AUTH_LOGOUT"

export interface IAuthState {
    loggedIn: boolean
    loggingIn: boolean
    user: object
}


const existingUser = getUser()
const defaultState = existingUser ? { loggedIn: true, user: existingUser } : {}

export const reducer = (state = defaultState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST: {
            return {
                ...state,
                loggingIn: true,
                user: null
            }
        }

        case LOGIN_SUCCESS: {
            return {
                ...state,
                loggedIn: true,
                user: action.user
            }
        }

        case LOGIN_FAILED: {
            return {}
        }

        case LOGOUT: {
            return {}
        }

        default:
            return state
    }
}



export const authLogin = (username: string, password: string) => dispatch => {
    dispatch(authLoginRequest({ username }))

    login(username, password).then(
        user => {
            dispatch(authLoginSuccess(user))
            history.push("/")
        },
        error => {
            dispatch(authLoginFailed(error))
            // dispatch(alertActions.error(error))
        }
    )
}

export const authLoginRequest = id => ({
    type: LOGIN_REQUEST,
    // id
})

export const authLoginSuccess = (user) => ({
    type: LOGIN_SUCCESS,
    user
})

export const authLoginFailed = (error) => ({
    type: LOGIN_FAILED
})
