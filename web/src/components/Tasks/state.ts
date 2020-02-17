import { Derive, IState, OnInitialize } from "overmind"
import { getHoursFromSeconds, getMinutesFromSeconds } from "../../util"

export type ID = string

export const onInitialize: OnInitialize = async ({ state, actions, effects }, overmind) => {
    console.log("haro")
    actions.initialLoad()
}

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

export interface ITaskHashMap {
    [id: string]: ITask
}

export interface ITaskListState extends IState {
    table: ITaskHashMap
    selectedID: string
    activeID: string
    filter: string
    showFutureTasks: boolean
    refreshTrigger: string
    tasks: Derive<ITaskListState, ITask[]>
    activeTask: Derive<ITaskListState, ITask>
}

const toInt = (b: boolean | undefined): number => (b ? 1 : 0)
const checkStarted = (a: ITask, b: ITask) => toInt(b.isStarted) - toInt(a.isStarted)
const checkDraft = (a: ITask, b: ITask) => toInt(b.isDraft) - toInt(a.isDraft)
const comparePriorities = (a: ITask, b: ITask) => b.priority - a.priority
const compareCreatedDate = (a: ITask, b: ITask) => b.createdAt - a.createdAt
const compareCompletedDate = (a: ITask, b: ITask) => b.completedAt - a.completedAt

const makeSortChain = sortChain => {
    return (a, b) => {
        for (const f of sortChain) {
            if (f(a, b) > 0) return 1
            if (f(b, a) > 0) return -1
        }
        return 0
    }
}

const sortFunc = makeSortChain([checkStarted, checkDraft, comparePriorities, compareCreatedDate])

const dayLength = 24 * 3600 * 1000
export const dueInDays = dueDate => {
    const now = Date.now()
    let diffDays = dueDate ? Math.ceil((dueDate - now) / dayLength) : 0
    if (diffDays < 0) diffDays = 0
    return diffDays
}

export const RESET_HOUR = 7
export const RESET_MINUTE = 0
const isCurrent = (task: ITask) => {
    if (dueInDays(task.dueDate) === 0) {
        if (task.dueTime) {
            const now = new Date()
            const d = new Date()
            d.setHours(RESET_HOUR)
            d.setMinutes(RESET_MINUTE)
            const resetTimestamp = d.getTime()
            if (now.getTime() < resetTimestamp) now.setDate(now.getDate() - 1)

            const dueTime = task.dueTime
            const h = getHoursFromSeconds(dueTime)
            const m = getMinutesFromSeconds(dueTime)
            d.setHours(h)
            d.setMinutes(m)
            const dueTimestamp = d.getTime()

            return now.getTime() >= dueTimestamp
        }
        return true
    }
    return false
}

export const state: ITaskListState = {
    table: {},
    activeID: null,
    selectedID: null,
    filter: "active",
    showFutureTasks: false,
    refreshTrigger: "ass",
    // flipKey: (state) // move to render
    activeTask: state => {
        return state.table[state.activeID]
    },
    tasks: state => {
        const visibilityFilter = state.filter
        const showFuture = state.showFutureTasks
        const tasks = Object.values(state.table)
        const trigger = state.refreshTrigger

        switch (visibilityFilter) {
            case "active":
                return tasks.filter(t => t.state === "active" && (showFuture || isCurrent(t))).sort(sortFunc)
            case "completed":
                return tasks.filter(t => t.state === "completed").sort(compareCompletedDate)
            default:
                return tasks.sort(sortFunc)
        }
    }
}
