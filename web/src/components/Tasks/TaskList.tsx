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
import { useOvermind } from '../../overmind'

const isBrowser = typeof window !== "undefined"

interface ITaskListProps {
    dispatch: Dispatch
    flipKey?: any
    tasks: ITask[]
    activeTask: ITask
    filter: string
    onAddClick: () => void
    onFilterToggle: () => void
    onFutureToggle: () => void
}

const makeFlipKey = (tasks) => {
    return tasks.reduce((acc, task) => (acc+task._id.substring(task._id.length-5)), "")
}

let resetSubscription: ZenObservable.Subscription
export const TaskList: React.FC<ITaskListProps> = (props) => {
    // const dispatch = useDispatch()

    const { state: globalState, actions, effects, reaction } = useOvermind()
    const tasksState = globalState.tasks
    const tasks = tasksState.tasks
    const flipKey = makeFlipKey(tasks)
    const showFutureTasks = tasksState.showFutureTasks
    const activeTask = tasksState.activeTask

    const taskActions = actions.tasks as any
    const onAddClick = taskActions.taskAdd
    const onFutureToggle = taskActions.taskToggleFutureTasks
    const onFilterToggle = taskActions.taskToggleFilter


    useEffect(() => {
    //     getTasks()
    //         .then(response => {
    //             dispatch({
    //                 type: "TASK_INIT",
    //                 newState: response.data.tasks
    //             })
    //         })
    //         .catch(err => console.error(err))

        actions.tasks.initialLoad()

        // if (isBrowser) {
        //     resetSubscription = resetSubscriptionQuery().subscribe({
        //         next(message) {
        //             // const updatedTasks = message.data.updateTasks
        //             // dispatch(taskMerge(updatedTasks))
        //         },
        //         error(err) { console.error('err', err); },
        //     });
        // }

        return () => {
            if (isBrowser) resetSubscription.unsubscribe()
        }
    }, [])

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


// const getStartedTasks = (tasks) => tasks.filter(t => {
//     return t.isStarted === true && t.startTime > 0
// })

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

export default TaskList