import { AnyAction } from "redux"
import { ThunkAction } from "redux-thunk"
import { createTask, saveTask, completeTask, uncompleteTask, addTaskProgress } from "../../api/api"
import { getRandomBrightColor, getRandomHex } from "../../util"
import uuidv4 from 'uuid'
import { IAppState, Thunk } from '../../store'

export type ID = string

export interface ITask {
    _id: ID
    title: string
    description: string
    priority: number
    state: string
    color: string
    dueDate: number // timestamp
    dueTime: number
    duration: number
    progress: number
    segmentDuration: number
    isRecurring: boolean
    createdAt: number
    completedAt?: number
    resetMode: string
    resetTime: number

    isDraft?: boolean
    isEditing?: boolean
    isExpanded?: boolean
    
    startTime?: number
    isStarted?: boolean
}
export interface ITaskState {
    list: ITask[]
    table: any,
    selectedID: string
    activeID: string
    filter: string
    refreshTrigger: string
}

const TASK_INIT = "TASK_INIT"
const TASK_MERGE = "TASK_MERGE"
const TASK_ADD = "TASK_ADD"
const TASK_START = "TASK_START"
const TASK_SELECT = "TASK_SELECT"
const TASK_STOP = "TASK_STOP"
const TASK_TOGGLE_EXPAND = "TASK_TOGGLE_EXPAND"
const TASK_EDIT = "TASK_EDIT"
const TASK_EDIT_CANCEL = "TASK_EDIT_CANCEL"
const TASK_SAVE_PENDING = "TASK_SAVE_PENDING"
const TASK_SAVE_SUCCESS = "TASK_SAVE_SUCCESS"
const TASK_SAVE_FAILED = "TASK_SAVE_FAILED"
const TASK_FORCE_DATE_CHECK = "TASK_FORCE_DATE_CHECK"

const TASK_CREATE_PENDING = "TASK_CREATE_PENDING"
const TASK_CREATE_SUCCESS = "TASK_CREATE_SUCCESS"
const TASK_CREATE_FAILED = "TASK_CREATE_FAILED"

const TASK_UPDATE_PROGRESS_PENDING = "TASK_UPDATE_PROGRESS_PENDING"
const TASK_UPDATE_PROGRESS_SUCCESS = "TASK_UPDATE_PROGRESS_SUCCESS"
const TASK_UPDATE_PROGRESS_FAILED = "TASK_UPDATE_PROGRESS_FAILED"

const TASK_TOGGLE_FILTER = "TASK_TOGGLE_FILTER"
const TASK_DELETE = "TASK_DELETE"

const initialState: ITaskState = {
    table: {},
    activeID: null,
    selectedID: null,
    filter: "active",
    refreshTrigger: "ass"
}

export const reducer = (state: ITaskState = initialState, action: AnyAction): ITaskState => {
    switch (action.type) {
        case TASK_INIT: {
            const newTasks = action.newState
            const newState = {}
            for (const task of newTasks) {
                newState[task._id] = task
            }
            return {
                ...state,
                table: {
                    // ...state.table,
                    ...newState
                }
            }
        }
        case TASK_MERGE: {
            const updatedTasks = action.serverData
            const updatedStateChunk = {
                ...state.table
            }
            for (const newTaskData of updatedTasks) {
                const taskID = newTaskData._id
                delete newTaskData.__typename
                const oldTaskData = state.table[taskID]
                updatedStateChunk[taskID] = {
                    ...oldTaskData,
                    ...newTaskData
                }
            }
            return {
                ...state,
                table: updatedStateChunk
            }
        }
        case TASK_START: {
            if (state.activeID !== null) return state
            const taskID = action._id
            const task = state.table[taskID]
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        startTime: Date.now(),
                        isStarted: true,
                    }
                },
                activeID: taskID
            }
        }
        case TASK_STOP: {
            const taskID = action._id
            const task = state.table[taskID]
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        startTime: 0,
                        isStarted: false,
                    }
                },
                activeID: null
            }
        }
        case TASK_TOGGLE_EXPAND: {
            const taskID = action._id
            const task = state.table[taskID]
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        isExpanded: !task.isExpanded
                    }
                },
            }
        }
        case TASK_EDIT: {
            const taskID = action._id
            const task = state.table[taskID]
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        isEditing: true,
                    }
                }
            }
        }
        case TASK_EDIT_CANCEL: {
            const taskID = action._id
            const task = state.table[taskID]
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        isEditing: false,
                        isExpanded: false,
                    }
                }
            }
        }
        case TASK_ADD: {
            const newTask: ITask = {
                _id: "__new__",// + uuidv4(),
                isDraft: true,
                isEditing: true,
                isExpanded: true,
                title: "New Task",
                priority: 1,
                segmentDuration: 0,
                duration: 0,
                dueTime: 0,
                progress: 0,
                resetMode: "inDays",
                resetTime: 1,
                description: "",
                isRecurring: false,
                color: getRandomBrightColor(),
                state: "active",
                createdAt: Math.floor(Date.now()/1000)
            }
            return {
                ...state,
                table: {
                    ...state.table,
                    __new__: newTask
                }
            }
        }

        case TASK_SAVE_SUCCESS: {
            const taskID = action._id
            const task = state.table[taskID]
            const serverData = action.serverData
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        ...serverData,
                        isEditing: false,
                        isDraft: false,
                    }
                }
            }
        }
        case TASK_CREATE_SUCCESS: {
            // const taskID = action._id
            const task = state.table.__new__
            const { _id, ...serverData } = action.serverData
            const newState = {
                ...state,
                table: {
                    ...state.table,
                    [_id]: {
                        ...task,
                        ...serverData,
                        _id,
                        isEditing: false,
                        isDraft: false,
                    }
                }
            }
            delete newState.table.__new__
            return newState
        }
        case TASK_UPDATE_PROGRESS_SUCCESS: {
            const taskID = action._id
            const task = state.table[taskID]
            return {
                ...state,
                table: {
                    ...state.table,
                    [taskID]: {
                        ...task,
                        ...action.taskProgress // that's an object w updated progress fields
                    }
                }
            }
        }
        case TASK_TOGGLE_FILTER: {
            return {
                ...state,
                filter: state.filter === "active" ? "completed" : "active"
            }
        }
        case TASK_FORCE_DATE_CHECK: {
            return {
                ...state,
                refreshTrigger: getRandomHex(4)
            }
        }
        case TASK_SELECT: {
            let newID = action._id
            if (newID === state.selectedID) newID = null
            return {
                ...state,
                selectedID: newID,
            }
        }
        // case TASK_DELETE: {
        //     return {
        //         ...state,
        //         list: state.list.filter(task => {
        //             return task._id !== action._id
        //         })
        //     }
        // }

        default:
            return state
    }
}

export const taskSave = (_id: ID, taskState) => {
    if (_id === "__new__")
        return dispatch => {
            createTask(taskState)
                .then(response => {
                    dispatch(taskCreateSuccess(response.data.createTask))
                })
                .catch(err => {
                    console.error(err)
                    dispatch(taskSaveFailed(_id, err))
                })
        }
    else
        return dispatch => {
            saveTask(taskState)
                .then(response => {
                    dispatch(taskSaveSuccess(_id, response.data.saveTask))
                })
                .catch(err => {
                    console.error(err)
                    dispatch(taskSaveFailed(_id, err))
                })
        }
}

export const taskDelete = (_id: ID) => dispatch => {
    const data = new FormData()
    const reqInit = { method: "DELETE", body: data }

    return fetch("/api/tasks/" + _id, reqInit).then(response => {
        if (response.ok) {
            dispatch(taskDeleteClient(_id))
        } else {
            dispatch(taskSaveError(_id))
        }
    })
}

export const taskComplete = (_id: ID): ThunkAction<void, IAppState, undefined, AnyAction > => {
    return dispatch => {
        // dispatch(taskCompletePending(_id))
        completeTask(_id)
            .then(response => {
                dispatch(taskProgressUpdateSuccess(_id, response.data.completeTask))
            })
            .catch(err => {
                console.error(err)
                dispatch(taskProgressUpdateFailed(_id, err))
            })
    }
}
// export const taskCompletePending = (_id: ID) => ({ type: TASK_COMPLETE_PENDING, _id })
export const taskProgressUpdateSuccess = (_id: ID, taskProgress: Partial<ITask>) => ({ type: TASK_UPDATE_PROGRESS_SUCCESS, _id, taskProgress })
export const taskProgressUpdateFailed = (_id: ID, err: Error) => ({ type: TASK_UPDATE_PROGRESS_FAILED, _id })


export const taskUncomplete = (_id: ID) => {
    return dispatch => {
        // dispatch(taskCompletePending(_id))
        uncompleteTask(_id)
            .then(response => {
                dispatch(taskProgressUpdateSuccess(_id, response.data.uncompleteTask))
            })
            .catch(err => {
                console.error(err)
                dispatch(taskProgressUpdateFailed(_id, err))
            })
    }
}


export const taskStopAndAddProgress = (_id: ID, progress: number) => {
    return dispatch => {
        dispatch(taskStop(_id))
        addTaskProgress(_id, progress)
            .then(response => {
                dispatch(taskProgressUpdateSuccess(_id, response.data.addProgress))
            })
            .catch(err => {
                console.error(err)
                dispatch(taskProgressUpdateFailed(_id, err))
            })
    }
}

export const taskToggleFilter = () => ({ type: TASK_TOGGLE_FILTER })
export const taskForceDateCheck = () => ({ type: TASK_FORCE_DATE_CHECK })
export const taskStart = (_id: ID) => ({ type: TASK_START, _id })
export const taskStop = (_id: ID) => ({ type: TASK_STOP, _id })
export const taskSelect = (_id: ID) => ({ type: TASK_SELECT, _id })
export const taskAdd = () => ({ type: TASK_ADD })
export const taskExpand = (_id: ID) => ({ type: TASK_TOGGLE_EXPAND, _id })
export const taskEdit = (_id: ID) => ({ type: TASK_EDIT, _id })
export const taskEditCancel = (_id: ID) => ({ type: TASK_EDIT_CANCEL, _id })
export const taskDeleteClient = (_id: ID) => ({ type: TASK_DELETE, _id })
export const taskSavePending = (_id: ID) => ({ type: TASK_SAVE_PENDING, _id })
export const taskSaveSuccess = (_id: ID, serverData: Partial<ITask>) => ({ type: TASK_SAVE_SUCCESS, _id, serverData })
export const taskSaveFailed = (_id: ID, error) => ({ type: TASK_SAVE_FAILED, _id, error })
// export const taskCreatePending = (_id: ID) => ({ type: TASK_CREATE_PENDING, _id })
export const taskCreateSuccess = (serverData: Partial<ITask>) => ({ type: TASK_CREATE_SUCCESS, serverData })
// export const taskCreateFailed = (_id: error) => ({ type: TASK_CREATE_FAILED, _id, error })
export const taskMerge = (serverData: Partial<ITask>) => ({ type: TASK_MERGE, serverData })