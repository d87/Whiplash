import React from 'react';
import { connect } from 'react-redux';
import Task from './Task';
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { withApollo } from "react-apollo";

import { Flipper, Flipped } from 'react-flip-toolkit';
import { ITask, ITaskState, taskAdd, taskToggleFilter, taskExpand, taskEdit, taskSaveSuccess, taskSaveFailed } from './TaskActions'
import { createSelector } from 'reselect'
import { AddButton } from './AddButton'
import { TaskTimer } from './TaskTimer'
import { Dispatch } from '../../store';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { getTasks } from '../../api/api'

import './Task.scss'

interface ITaskListProps {
    dispatch: Dispatch
    flipKey?: any
    tasks: ITask[]
    activeTask: ITask
    filter: string
    onAddClick: () => void
    onFilterToggle: () => void
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
        const { tasks, activeTask, flipKey, onAddClick, onFilterToggle } = this.props
        return (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: "0.2em" }}>
                    <a className="material-icons clickable largeText" onClick={onAddClick}>add_box</a>
                    <a className={`material-icons marginRight10 toggleable ${this.props.filter === "completed" ? "toggled" : "" }`} onClick={onFilterToggle}>done_all</a>
                </div>
                
                
                <section styleName="taskList">
                    <Flipper flipKey={flipKey}>
                        {activeTask && <TaskTimer flipId="Timer" {...activeTask}/>}
                        {tasks.map(task =>
                            <Flipped key={task._id} flipId={task._id}>
                                {flippedProps => <Task flippedProps={flippedProps} {...task}/>}
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


const makeFlipKey = (tasks) => {
    return tasks.reduce((acc, task) => (acc+task._id.substring(task._id.length-5)), "")
}

const getVisibilityFilter = (state, props) => state.tasks.filter
const getTasksForSelector = (state): ITask[] => Object.values(state.tasks.table)
export const getSortedVisibleTodos = createSelector(
    [ getVisibilityFilter, getTasksForSelector ],
    (visibilityFilter, tasks) => {
        switch (visibilityFilter) {
            case 'active':
                return tasks.filter(t => t.state === "active").sort(sortFunc)
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

const mapStateToProps = (state, props) => {
    const tasks = getSortedVisibleTodos(state, props)
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
        }
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(withApollo(TaskList))
