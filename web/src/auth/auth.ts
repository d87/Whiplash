import { Dispatch } from 'redux';
import { history } from '../history'
import config from "../config"
import { MiniDaemon } from '../util'
import { store } from '../store'
// import { reducer } from './authActions'

interface IUser {
    _id: string
    username: string
    accessToken: string
    refreshToken: string
    expiresIn: number
}


// const refreshTimer = new MiniDaemon(null, () => {
//     if (isTokenExpiringSoon()) {
//         requestNewToken(getUser(), getRefreshToken())
//             // .then( store.dispatch() )
//     }
// }, 60*60*1000, Infinity)
// refreshTimer.start()

const handleAuthResponse = (response: Response): Promise<IUser> => {
    return response.text().then(text => {
        const data = text && JSON.parse(text)
        if (!response.ok) {
            if (response.status === 401) {
                Promise.reject("Unauthorized")
            }

            const error = (data && data.message) || response.statusText
            return Promise.reject(error)
        }

        return data
    })
}

const acceptNewCredentials = (user: IUser): IUser => {
    // login successful if there's a jwt token in the response
    if (user.accessToken) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        storeToken(user)
        storeUser(user)
    } else {
        Promise.reject("Token was not received")
    }

    return user
}

export const loginSession = (username: string, password: string): Promise<IUser> => {
    const requestOptions: RequestInit  = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password })
    }

    return fetch(`${config.apiUrl}/users/login`, requestOptions)
        .then(handleAuthResponse)
        .catch(error => {
            if (error === "Unauthorized") {
                logoutSession()
                history.location.reload(true);
            }
        })
        .then(storeUser)

        
}
export const logoutSession = () => {
    // pass
}


export const loginJWT = (username: string, password: string): Promise<IUser> => {
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "same-origin",
        body: JSON.stringify({ username, password })
    }

    return fetch(`${config.apiUrl}/users/login`, requestOptions)
        .then(handleAuthResponse)
        .catch(error => {
            // auto logout if 401 response returned from api
            if (error === "Unauthorized") {
                logout()
                history.location.reload(true);
            }
        })
        .then(acceptNewCredentials)
}

export const requestNewToken = (user: { _id: string }, refreshToken: string): Promise<IUser> => {
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ id: user._id, refreshToken })
    }

    return fetch(`${config.apiUrl}/users/token`, requestOptions)
        .then(handleAuthResponse)
        .then(acceptNewCredentials)
}

export const logoutJWT = () => {
    // remove user from local storage to log user out
    localStorage.removeItem("token")
    localStorage.removeItem("tokenExpiresAt")
}

const storeToken = (user): void => {
    localStorage.setItem("token", user.accessToken)

    if (user.refreshToken) {
        localStorage.setItem("refreshToken", user.refreshToken)
    }

    // not decoding the token for exp date
    if (user.expiresIn) {
        const now = Date.now()
        const expirationDate = Date.now() + user.expiresIn * 1000
        localStorage.setItem("tokenExpiresAt", expirationDate.toString())
    }
}

const storeUser = (user: IUser) => {
    delete user.accessToken
    delete user.refreshToken
    localStorage.setItem("user", JSON.stringify(user))
    return user
}

export const isTokenExpired = (): boolean => {
    const expTime = parseInt(localStorage.getItem("tokenExpiresAt"), 10)
    return (Date.now() > expTime)
}

export const isTokenExpiringSoon = (remainingTime: number = 3600): boolean => {
    const expTime = parseInt(localStorage.getItem("tokenExpiresAt"), 10)
    return (Date.now() + remainingTime > expTime)
}

export const isLoggedIn = (): boolean => {
    const token = localStorage.getItem("token")
    return token !== null
}


export const getToken = (): string => {
    return localStorage.getItem("token")
}

export const getRefreshToken = (): string => {
    return localStorage.getItem("refreshToken")
}

export const getBearerToken = (): string => {
    return `Bearer ${localStorage.getItem("token")}`
}

export const getUser = () => {
    return JSON.parse(localStorage.getItem("user"))
}