import { Action } from 'overmind'
import { ITask } from './state'
import { getRandomBrightColor, getRandomHex } from "../../util"

export type ID = string

export const initialLoad = async ({ effects, state }) => {
    // state.currentUser = await effects.getCurrentUser()

    const response = await effects.tasks.getTasks()

    const loadedTasks = response.data.tasks

    console.log("haro", loadedTasks)
    console.log(state)

    const newTasksMap = {}
    for (const task of loadedTasks) {
        newTasksMap[task._id] = task
    }

    state.tasks.table = newTasksMap
}

export const taskAdd = ({ state }) => {
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
        dueDate: 0,
        progress: 0,
        resetMode: "inDays",
        resetTime: 1,
        description: "",
        isRecurring: false,
        color: getRandomBrightColor(),
        state: "active",
        createdAt: Math.floor(Date.now()/1000)
    }
    state.table["__new__"] = newTask
}

export const taskToggleFilter = ({ state }) => {
    state.filter = state.filter === "active" ? "completed" : "active"
}

export const taskToggleFutureTasks = ({ state }) => {
    state.showFutureTasks = !state.showFutureTasks
}


/*
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


export const taskForceDateCheck = () => ({ type: TASK_FORCE_DATE_CHECK })
export const taskStart = (_id: ID) => ({ type: TASK_START, _id })
export const taskStop = (_id: ID) => ({ type: TASK_STOP, _id })
export const taskSelect = (_id: ID) => ({ type: TASK_SELECT, _id })
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

*/