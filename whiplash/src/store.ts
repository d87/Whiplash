import { AnyAction, Action, Store, createStore, combineReducers, applyMiddleware, bindActionCreators } from "redux"
import thunk, { ThunkAction, ThunkDispatch, ThunkMiddleware } from "redux-thunk"
import { createLogger } from "redux-logger"
import { composeWithDevTools } from "redux-devtools-extension"

import { reducer as auth } from "./auth/authActions"
import { reducer as tasks } from "./components/Tasks/TaskActions"
import { soundReducer as sound } from "./components/SoundPlayer/SoundPlayer"
import { ITimerState, timerReducer as timers } from "./components/TimerApp/TimerAppActions"
import { registerKeybindings } from './bindings'

import { getTasks } from "./api/api"

export interface IAppState {
    timer: ITimerState

    sound: any
    tasks: any
}

export type Thunk = ThunkAction<void, IAppState, null, AnyAction>;
export type Dispatch = ThunkDispatch<any, null, AnyAction>;

export const reducers = combineReducers({
    auth,
    tasks,
    sound,
    timers
})

const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
})

// let actionID = parseInt(localStorage.getItem("crossTabActionID"), 10) || 0
// const timestampAction = (action: AnyAction) => {
//     actionID++
//     return {
//         action,
//         time: Date.now(),
//         actionID
//     }
// }

// const storageMiddleware = ({ dispatch, getState }) => next => action => {
//     if (!action.noDuplicate) {
//         const stampedAction = timestampAction(action)
//         // console.log("duplicating ", action.type)
//         localStorage.setItem("crossTabActionID", stampedAction.actionID.toString())
//         localStorage.setItem("crossTabActionSync", JSON.stringify(stampedAction))
//     }
//     next(action)
// }

// const listenedKeys = {
//     crossTabActionSync: true
// }

// const createStorageListener = (reduxStore: Store<any>) => {
//     return (event: StorageEvent) => {
//         // console.log("asd")
//         if (!listenedKeys[event.key]) return
//         // the storage event tells you which value changed
//         const { actionID: newActionID, action } = JSON.parse(event.newValue)
//         action.noDuplicate = true
//         console.log("RECEIVED ", newActionID, action.type)

//         reduxStore.dispatch(action)
//     }
// }

const middleware = []

if (process.env.NODE_ENV !== "production") {
    // const actionLogger = ({dispatch, getState}) =>
    //     (next) => (action) => { console.log(action); return next(action) }

    const logger = createLogger({})

    middleware.push(logger)
}

const enchancers = composeEnhancers(
    applyMiddleware(thunk as ThunkMiddleware<IAppState, AnyAction>)
    // other store enhancers if any
)

let preloadedState = {}
if (window !== undefined) {
    preloadedState = (window as any).__PRELOADED_STATE__
}

export const store = createStore(reducers, preloadedState, applyMiddleware(thunk as ThunkMiddleware<IAppState, AnyAction>))

registerKeybindings(store)

// if (window !== undefined) {
//     window.addEventListener("storage", createStorageListener(store))
// }


