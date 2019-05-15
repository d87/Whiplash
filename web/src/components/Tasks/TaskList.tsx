import React, { useEffect, useState} from 'react';
import { connect, useDispatch } from 'react-redux';
import Task from './Task';
import { withApollo } from "react-apollo";
import { Dispatch } from 'redux'
import { Flipper, Flipped } from 'react-flip-toolkit';
import { ITask, ITaskState, taskAdd, taskMerge, taskToggleFilter, taskExpand, taskEdit, taskSaveSuccess, taskSaveFailed, taskForceDateCheck, taskToggleFutureTasks } from './TaskActions'
import { createSelector } from 'reselect'
import { TaskTimer } from './TaskTimer'
import { Timeline } from '../Timeline/Timeline'
import { getTasks, resetSubscriptionQuery } from '../../api/api'
import { MiniDaemon, getHoursFromSeconds, getMinutesFromSeconds } from '../../util'
import { getStore } from '../../store'
import './Task.scss'
import { playSound } from '../SoundPlayer/SoundPlayer';

const isBrowser = typeof window !== "undefined"

interface ITaskListProps {
    dispatch: Dispatch
    flipKey?: any
    tasks: ITask[]
    activeTask: ITask
    showFutureTasks: boolean
    filter: string
    onAddClick: () => void
    onFilterToggle: () => void
    onFutureToggle: () => void
}


let resetSubscription: ZenObservable.Subscription
export const TaskList: React.FC<ITaskListProps> = (props) => {
    const dispatch = useDispatch()

    useEffect(() => {
        // getTasks()
        //     .then(response => {
        //         dispatch({
        //             type: "TASK_INIT",
        //             newState: response.data.tasks
        //         })
        //     })
        //     .catch(err => console.error(err))

        if (isBrowser) {
            resetSubscription = resetSubscriptionQuery().subscribe({
                next(message) {
                    const updatedTasks = message.data.updateTasks
                    dispatch(taskMerge(updatedTasks))
                },
                error(err) { console.error('err', err); },
            });
        }

        return () => {
            if (isBrowser) resetSubscription.unsubscribe()
        }
    }, [])

    const { tasks, activeTask, flipKey, onAddClick, showFutureTasks, onFilterToggle, onFutureToggle } = props

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: "0.2em" }}>
                <a className="material-icons clickable largeText" onClick={onAddClick}>add_box</a>
                <div>
                    <a className={`material-icons marginRight10 toggleable ${showFutureTasks ? "toggled" : "" }`} onClick={onFutureToggle}>history</a>
                    <a className={`material-icons marginRight10 toggleable ${props.filter === "completed" ? "toggled" : "" }`} onClick={onFilterToggle}>done_all</a>
                </div> 
            </div>
            
            <div className="taskListGrid">
                <Timeline />
                <section className="taskList">
                    <Flipper flipKey={flipKey}>
                        {activeTask && <TaskTimer flipId="Timer" {...activeTask}/>}
                        {tasks.map(task =>
                            <Flipped key={task._id} flipId={task._id}>
                                {flippedProps => <Task flippedProps={flippedProps} task={task}/>}
                            </Flipped>
                        )}
                    </Flipper>
                </section>
            </div>
        </div>
    )
}

const toInt = (b: boolean|undefined): number => b ? 1: 0
const checkStarted = (a: ITask, b: ITask) => toInt(b.isStarted) - toInt(a.isStarted)
const checkDraft = (a: ITask, b: ITask) => toInt(b.isDraft) - toInt(a.isDraft)
const comparePriorities = (a: ITask, b: ITask) => b.priority - a.priority
const compareCreatedDate = (a: ITask, b: ITask) => b.createdAt - a.createdAt
const compareCompletedDate = (a: ITask, b: ITask) => b.completedAt - a.completedAt

const makeSortChain = sortChain => {
    return (a, b) => {
      for (const f of sortChain) {
        if (f(a, b) > 0) return 1;
        if (f(b, a) > 0) return -1;
      }
      return 0;
    };
};

const sortFunc = makeSortChain([
    checkStarted,
    checkDraft,
    comparePriorities,
    compareCreatedDate
])

const dayLength = 24 * 3600 * 1000
export const dueInDays = (dueDate) => {
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
            if (now.getTime() < resetTimestamp)
                now.setDate(now.getDate()-1)

            const dueTime = task.dueTime
            const h = getHoursFromSeconds(dueTime)
            const m = getMinutesFromSeconds(dueTime)
            d.setHours(h)
            d.setMinutes(m)
            const dueTimestamp = d.getTime()
           
            
            return (now.getTime() >= dueTimestamp)
        }
        return true
    }
    return false
}

const makeFlipKey = (tasks) => {
    return tasks.reduce((acc, task) => (acc+task._id.substring(task._id.length-5)), "")
}

const getVisibilityFilter = (state, props) => state.tasks.filter
const getShowFutureStatus = (state, props) => state.tasks.showFutureTasks
const getTasksForSelector = (state): ITask[] => Object.values(state.tasks.table)
const getRefreshTrigger = (state) => state.tasks.refreshTrigger
export const getSortedVisibleTodos = createSelector(
    [ getVisibilityFilter, getShowFutureStatus, getTasksForSelector, getRefreshTrigger ],
    (visibilityFilter, showFuture, tasks, trigger) => {
        switch (visibilityFilter) {
            case 'active':
                return tasks.filter(t => t.state === "active" && (showFuture || isCurrent(t))).sort(sortFunc)
            case 'completed':
                return tasks.filter(t => t.state === "completed").sort(compareCompletedDate)
            default:
                return tasks.sort(sortFunc)
        }
    }
)

const getStartedTasks = (tasks) => tasks.filter(t => {
    return t.isStarted === true && t.startTime > 0
})

let storedTasksN = 0
const refresher = new MiniDaemon(null, () => {
    const currentTasksAmount = storedTasksN
    const store = getStore()
    store.dispatch(taskForceDateCheck())
    const newTasksAmount = storedTasksN
    if (newTasksAmount > currentTasksAmount) {
        playSound("mgs")
    }
}, 10*60*1000)
// }, 15*1000)
// refresher.start()

const mapStateToProps = (state, props) => {
    const tasks = getSortedVisibleTodos(state, props)
    storedTasksN = tasks.length
    const activeTask = state.tasks.table[state.tasks.activeID]
    const flipKey = makeFlipKey(tasks)
    return {
        tasks,
        flipKey,
        filter: getVisibilityFilter(state, props),
        selectedTaskID: state.tasks.selectedID,
        activeTask,
        showFutureTasks: state.tasks.showFutureTasks
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        dispatch,

        onAddClick: () => {
            dispatch(taskAdd())
        },
        onFilterToggle: () => {
            dispatch(taskToggleFilter())
        },
        onFutureToggle: () => {
            dispatch(taskToggleFutureTasks())
        }
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(TaskList)
