export interface ITimer {
    id: number
    text: string
    startTime: number
    duration: number
    color: string | "dynamic"
    active: boolean
    soundID?: number
    showCounter?: boolean
    count?: number
    next?: number
}

export interface ITimerState {
    list: ITimer[],
    count: number,
}

const defaultState = {
    list: [
        {
            id: 1,
            text: "Rest",
            startTime: 0,
            duration: 7,
            color: "#6E8BDB",
            active: false,
            soundID: 4,
            showCounter: false,
            count: 0,
            next: 2
        },
        {
            id: 2,
            text: "OSSU",
            startTime: 0,
            duration: 5,
            color: "#8265AC",
            active: false,
            soundID: 2, // chew
            showCounter: false,
            count: 0,
            next: 3
        },
        {
            id: 3,
            text: "Flex",
            startTime: 0,
            duration: 20,
            color: "#C265AC",
            active: false,
            soundID: 4, // ping
            showCounter: false,
            count: 0,
            next: 4
        },
        {
            id: 4,
            text: "Release",
            startTime: 0,
            duration: 5,
            color: "#8265AC",
            active: false,
            soundID: 3, // abolish
            showCounter: true,
            count: 0,
            next: 1
        },
    ],
    count: 0,
}


// Reducer

export const timerReducer = (state = defaultState, action) => {
    switch (action.type) {
        // case 'TODO_INIT': {
        //     return action.newState
        // }
        case 'TIMER_START': {
            return {
                ...state,
                list: state.list.map(timer => {
                    if (timer.id === action.id && !timer.active )
                        return {
                            ...timer,
                            active: true,
                            startTime: Date.now()
                        }
                    else
                        return timer
                })
            }
        }

        case 'TIMER_FINISH': {
            return {
                ...state,
                list: state.list.map(timer => {
                    if (timer.id === action.id && timer.active )
                        return {
                            ...timer,
                            active: false,
                            startTime: 0,
                            count: timer.count+1
                        }
                    else
                        return timer
                })
            }
        }

        case 'TIMER_SET_DURATION': {
            return {
                ...state,
                list: state.list.map(timer => {
                    if (timer.id === action.id )
                        return {
                            ...timer,
                            duration: action.duration,
                        }
                    else
                        return timer
                })
            }
        }

        case 'TIMER_START_NEXT': {
            const currentTimer = state.list.find(timer => {
                return timer.id === action.id
            })
            const nextTimerID = currentTimer.next

            if (!nextTimerID)
                return state

            return {
                ...state,
                list: state.list.map(timer => {
                    if (timer.id === nextTimerID && !timer.active )
                        return {
                            ...timer,
                            active: true,
                            startTime: Date.now(),
                        }
                    else
                        return timer
                })
            }
        }

        case 'TIMER_RESET_ALL': {
            return {
                ...state,
                list: state.list.map(timer => {
                    return {
                        ...timer,
                        active: false,
                        startTime: 0,
                    }
                })
            }
        }

        case 'TIMER_RESET_COUNTER': {
            return {
                ...state,
                list: state.list.map(timer => {
                    if (timer.count > 0)
                        return {
                            ...timer,
                            count: 0,
                        }
                    else
                        return timer
                })
            }
        }

        default: return state;
    }
}


export const timerStart = (id) => ({
    type: "TIMER_START",
    id
})

export const timerStartNext = (id) => ({
    type: "TIMER_START_NEXT",
    id
})

export const timerFinish = (id) => ({
    type: "TIMER_FINISH",
    id
})

export const timerResetAll = () => ({
    type: "TIMER_RESET_ALL",
})

export const timerResetCounter = () => ({
    type: "TIMER_RESET_COUNTER",
})

export const timerSetDuration = (id, duration) => ({
    type: "TIMER_SET_DURATION",
    id,
    duration
})