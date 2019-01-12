import { Store } from "redux"
import { taskStart } from './components/Tasks/TaskActions'

const disableOnInputs = true

const bindings = {
    "CTRL-Y": (state, dispatch) => {
        const selID = state.tasks.selectedID
        if (selID)
            dispatch(taskStart(selID))
        // store.dispatch
    },
    "SPACE": (state, dispatch) => {
            const selID = state.tasks.selectedID
            if (selID)
                dispatch(taskStart(selID))
            // store.dispatch
    }
}


const eventToBindString = (event: KeyboardEvent) => {
    const ctrl = event.ctrlKey
    const alt = event.altKey
    const shift = event.shiftKey
    let key = event.key
    const keyCode = event.keyCode
    if (keyCode === 32) key = "SPACE"
    return `${ctrl ? "CTRL-" : ""}${shift ? "SHIFT-" : ""}${alt ? "ALT-" : ""}${key.toUpperCase()}`
}


const handleKeyDown = (store: Store) => (event: KeyboardEvent): void => {
    if (disableOnInputs) {
        let element
        if(event.target) element=event.target
        if(element.nodeType === 3) element=element.parentNode;
        if(element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') return;
    }
    console.log(event.key, event.keyCode)

    const bindString = eventToBindString(event)
    const func = bindings[bindString]
    if (func === undefined) return

    event.preventDefault()
    event.stopPropagation()
    
    const state = store.getState()
    const dispatch = store.dispatch
    func(state, dispatch)
}

export const registerKeybindings = (store: Store) => {
    if (document !== undefined) {
        document.addEventListener("keydown", handleKeyDown(store))
    }
}
