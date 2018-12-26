import React from 'react';
import { connect } from 'react-redux';
import Task from './Task';
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { withApollo } from "react-apollo";

import { Flipper, Flipped } from 'react-flip-toolkit';
import { ITask, ITaskState, taskAdd, taskToggleFilter, taskExpand, taskEdit, taskSaveSuccess, taskSaveFailed, taskForceDateCheck, taskToggleFutureTasks } from './TaskActions'
import { createSelector } from 'reselect'
import { AddButton } from './AddButton'
import { TaskTimer } from './TaskTimer'
import { Dispatch, store } from '../../store';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { getTasks } from '../../api/api'
import { MiniDaemon, getHoursFromSeconds, getMinutesFromSeconds } from '../../util'

import './Task.scss'
import { playSound } from '../SoundPlayer/SoundPlayer';

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

export class TaskList extends React.Component<ITaskListProps,{}> {
    componentDidMount() {
        getTasks()
            .then(response => {
                this.props.dispatch({
                    type: "TASK_INIT",
                    newState: response.data.tasks
                })
            })
            .catch(err => console.error(err))
    }

    render() {
        const { tasks, activeTask, flipKey, onAddClick, onFilterToggle, onFutureToggle } = this.props
        return (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: "0.2em" }}>
                    <a className="material-icons clickable largeText" onClick={onAddClick}>add_box</a>
                    <div>
                        <a className={`material-icons marginRight10 toggleable ${this.props.showFutureTasks ? "toggled" : "" }`} onClick={onFutureToggle}>history</a>
                        <a className={`material-icons marginRight10 toggleable ${this.props.filter === "completed" ? "toggled" : "" }`} onClick={onFilterToggle}>done_all</a>
                    </div> 
                </div>
                
                
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
        )
    }
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
    store.dispatch(taskForceDateCheck())
    const newTasksAmount = storedTasksN
    if (newTasksAmount > currentTasksAmount) {
        store.dispatch(playSound("mgs"))
    }
// }, 15*60*1000)
}, 15*1000)
refresher.start()

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
        activeTask 
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



export default connect(mapStateToProps, mapDispatchToProps)(withApollo(TaskList))
