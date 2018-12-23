import React from "react"
import { Dispatch } from "../../store"
import { ThunkDispatch } from "redux-thunk"
import { connect } from "react-redux"
import { createSelector } from "reselect"
import Swipeable from "react-swipeable"
import { EditableTask } from './TaskEditableDisplay'


import Remarkable from "remarkable"
import { GetGradientColor, getRandomBrightColor, formatTimeRemains } from "../../util"
import { ClickableProgressBar } from "../ProgressBar/ProgressBar"
import {
    ITaskState,
    ITask,
    taskAdd,
    taskExpand,
    taskEdit, taskEditCancel,
    taskSave,
    taskStart,
    taskSelect,
    taskComplete,
    taskUncomplete,
    taskDelete,
    taskDeleteClient
} from "./TaskActions"
import styles from "./Task.scss"
import { history } from "../../history"

export const calculatePriority = (isUrgent: boolean, isImportant: boolean) => {
    let prio = 1
    if (isUrgent && isImportant) prio = 4
    else if (isImportant) prio = 3
    else if (isUrgent && !isImportant) prio = 2
    return prio
}

const markdown = new Remarkable()

const MarkdownView = ({ source, ...props }) => {
    const mdhtml = { __html: markdown.render(source) }
    return <div dangerouslySetInnerHTML={mdhtml} {...props} />
}

interface ITaskHeaderProps {
    slideLeft: number
    slideRight: number
    isRecurring: boolean
    priority: number
    onExpand: () => void
    color: string
    title: string
    state: string
    progress: number
    statusText: string
    onComplete: () => void
    onUncomplete: () => void
    onStart: () => void
    onEdit: () => void
    // onClick: () => void
    onDoubleClick: () => void
}
interface ITaskHeaderState {
    isHovering: boolean
}
class TaskHeader extends React.Component<ITaskHeaderProps, ITaskHeaderState> {
    constructor(props) {
        super(props)
        this.state = {
            isHovering: false
        }
    }
    handleMouseEnter = (event: React.MouseEvent<any>) => {
        this.setState({ isHovering: true })
    }
    handleMouseLeave = (event: React.MouseEvent<any>) => {
        this.setState({ isHovering: false })
    }
    render() {
        const {
            slideLeft,
            slideRight,
            onExpand,
            isRecurring,
            // isSelected,
            priority,
            statusText,
            color,
            title,
            state,
            onComplete,
            onUncomplete,
            onStart,
            onEdit,
            // onClick,
            onDoubleClick
        } = this.props

        return (
            <div
                className="taskHeader"
                style={{ left: slideLeft, paddingLeft: `${slideRight}px` }}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                // onClick={onClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onExpand}
            >
                <PriorityMarker priority={priority} />
                <StatusMarker isRecurring={isRecurring} />

                <div className="taskTitle">
                    <span style={{ color }}>{title}</span>
                    {statusText && <small className="marginLeft10">{statusText}</small>}
                    {this.state.isHovering &&
                        (state === "completed" ? (
                            <div className="taskControls">
                                <a className={`material-icons`} onClick={onUncomplete}>
                                    restore
                                </a>
                            </div>
                        ) : (
                            <div className="taskControls">
                                <a className={`material-icons clickable mediumText`} onClick={onStart}>
                                    play_circle_outline
                                </a>
                                <a className={`material-icons clickable mediumText`} onClick={onComplete}>
                                    check_circle_outline
                                </a>
                                {/* <a className={`material-icons clickable mediumText`} onClick={onEdit}>
                                    more_vert
                                </a> */}
                            </div>
                        ))}
                </div>
            </div>
        )
    }
}


const NormalExpand = ({ description, onEdit }) => (
    <div className="taskExpanded">
        <a className="paperButton stretch marginTop10 thinButton" onClick={onEdit}>
            Edit
        </a>
        <MarkdownView className="taskDescriptionView" source={description} />
    </div>
)


const prioColors = [null, "priosvg_green", "priosvg_yellow", "priosvg_orange", "priosvg_red"]
export const PriorityMarker = ({ priority }) => {
    const color = prioColors[priority]
    return (
        <div className="taskPriority">
            <svg className={color} viewBox="0 0 28.5 88" preserveAspectRatio="none">
                <polygon points="9.5,88 0,77.3 0,0 9.5,8.7 9.5,88" />
                <rect x="9.5" y="8.67" width="19" height="80" />
                <polygon points="9.5 8.67 28.5 8.67 19 0 0 0 9.5 8.67" />
            </svg>
        </div>
    )
}

export const StatusMarker = ({ isRecurring }) => {
    if (isRecurring) return <div style={{ height: "100%", width: "2px", backgroundColor: "#040804" }} />
    else return null
}

interface ITaskProps extends ITask {
    task: ITask
    dispatch: Dispatch
    flippedProps?: any
    isSelected: boolean
    onExpand: () => void
    onEdit: () => void
    onEditCancel: () => void
    onEditSubmit: (newData) => void
    onDelete: () => void
}
interface ITaskComponentState {
    xOffset: number
    paddingXOffset: number
}



class Task extends React.Component<ITaskProps, ITaskComponentState> {
    constructor(props: ITaskProps) {
        super(props)
        const task = props.task
        this.state = {
            xOffset: 0,
            paddingXOffset: 0
        }
    }

    // handleTitleClick = (e: React.MouseEvent<any>) => {
    //     this.props.dispatch(taskSelect(this.props._id))
    // }

    handleTitleDoubleClick = (e?: React.MouseEvent<any>) => {
        this.props.dispatch(taskStart(this.props.task._id))
    }

    handleTitleContextMenu = (e?: React.MouseEvent<any>) => {
        e.preventDefault()

        this.props.dispatch(taskExpand(this.props.task._id))
        return false
    }

    handleSubmit = (values) => {
        const _id = this.props.task._id
        const newTaskData = { _id, ...values }

        return this.props.onEditSubmit(newTaskData)
    }

    // handleMouseEnter(event) {
    //     this.setState({ isHovering: true })
    // }
    // handleMouseLeave(event) {
    //     this.setState({ isHovering: false })
    // }

    handleSwipingLeft = (e, absX) => {
        if (absX > 80) absX = 80
        this.setState({ xOffset: -absX })
    }
    handleSwipedLeft = (e, absX, isFlick) => {
        this.setState({ xOffset: 0 })
        if (absX > 30) {
            if (this.props.state === "completed") {
                this.props.dispatch(taskUncomplete(this.props._id))
            } else {
                this.props.dispatch(taskStart(this.props._id))
                // history.push("/activity")
            }
        }
        // console.log("You Swiped...", absX, isFlick)
    }
    handleSwipingRight = (e, absX) => {
        if (absX > 80) absX = 80
        this.setState({ paddingXOffset: absX })
    }
    handleSwipedRight = (e, x, isFlick) => {
        this.setState({ paddingXOffset: 0 })
        // console.log("You Swiped...", x, isFlick)
        if (-x > 50) {
            this.props.dispatch(taskComplete(this.props._id))
            // history.push("/activity")
        }
    }

    completeTask = (e?: React.MouseEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        this.props.dispatch(taskComplete(this.props.task._id))
    }
    uncompleteTask = (e?: React.MouseEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        this.props.dispatch(taskUncomplete(this.props.task._id))
    }
    startTask = (e?: React.MouseEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        this.props.dispatch(taskStart(this.props.task._id))
    }

    render() {
        const { flippedProps, task } = this.props
        const {
            _id,
            description,
            progress,
            duration,
            segmentDuration,
            isStarted,
            priority,
            title,
            resetTime,
            state,
            isRecurring,
            isExpanded, isEditing, color
        } = task
        const { onExpand, onEdit, onEditCancel, onDelete } = this.props

        let statusText
        if (duration > 0) {
            let percent
            if (progress > 0) {
                percent = Math.floor((progress / duration) * 100)
                if (percent > 100) percent = 100
            }
            statusText = percent ? `${percent}%, ${formatTimeRemains(duration)}` : `${formatTimeRemains(duration)}`
        }

        // const priorityColor = GetGradientColor(this.state.priority / 100)
        // console.log("render task", this.props)
        return (
            <div className={`task ${isStarted ? "marginBottom30" : ""}`} {...flippedProps}>
                {isEditing ? (
                    <EditableTask task={task} onSubmit={this.handleSubmit} onEditCancel={onEditCancel} />
                ) : (
                    <div>
                        <Swipeable
                            onSwipingLeft={this.handleSwipingLeft}
                            onSwipedLeft={this.handleSwipedLeft}
                            onSwipingRight={this.handleSwipingRight}
                            onSwipedRight={this.handleSwipedRight}
                            trackMouse={false}
                            className="swipeBox"
                        >
                            <TaskHeader
                                slideLeft={this.state.xOffset}
                                slideRight={this.state.paddingXOffset}
                                color={color}
                                title={title}
                                priority={priority}
                                statusText={statusText}
                                onExpand={this.handleTitleContextMenu}
                                // isSelected={isSelected}
                                isRecurring={isRecurring}
                                state={state}
                                progress={progress}
                                onComplete={this.completeTask}
                                onUncomplete={this.uncompleteTask}
                                onStart={this.startTask}
                                onEdit={onEdit}
                                // onClick={this.handleTitleClick}
                                onDoubleClick={this.handleTitleDoubleClick}
                            />
                        </Swipeable>
                        {isExpanded && <NormalExpand description={description} onEdit={onEdit} />}
                    </div>
                )}
            </div>
        )
    }
}

const getCreatedDate = (state, props) => props.createdAt
const makeIsNewSelector = () => {
    return createSelector(
        getCreatedDate,
        (timestamp: string) => {
            const ts = parseInt(timestamp, 10)
            const now = Date.now()
            const diff = 48 * 60 * 60000 // 48 hours
            return now - diff < ts
        }
    )
}

const getProgress = (state, props) => props.progress
const getLength = (state, props) => props.length
const getTaskState = (state, props) => props.state
const makeIsUnfinishedSelector = () => {
    return createSelector(
        getProgress,
        getLength,
        getTaskState,
        (progress: number, length: number, taskState: string) => {
            return progress > 0 && length > 0 && progress < length && taskState === "active"
        }
    )
}

// If the mapStateToProps argument supplied to connect returns a function instead of an object,
// it will be used to create an individual mapStateToProps function for each instance of the container.
const makeMapStateToProps = () => {
    const isNewSelector = makeIsNewSelector()
    const isUnfinishedSelector = makeIsUnfinishedSelector()
    const mapStateToProps = (state, props) => {
        return {
            isNew: isNewSelector(state, props),
            isUnfinished: isUnfinishedSelector(state, props),
            isSelected: state.tasks.selectedID === props._id
        }
    }
    return mapStateToProps
}

const mapDispatchToProps = (dispatch: Dispatch, props) => {
    return {
        dispatch,
        onExpand: () => {
            dispatch(taskExpand(props.task._id))
        },
        onEdit: () => {
            dispatch(taskEdit(props.task._id))
        },
        onEditCancel: () => {
            dispatch(taskEditCancel(props.task._id))
        },
        onEditSubmit: newData => {
            dispatch(taskSave(props.task._id, newData))
        },

        onDelete: () => {
            dispatch(taskDelete(props.task._id))
        }
    }
}

// const ConnectedTaskEditor = connect(null, mapDispatchToProps)(TaskEditor)

const ConnectedTask = connect(
    makeMapStateToProps,
    mapDispatchToProps
)(Task)

export {
    // ConnectedTaskEditor as TaskEditor,
    ConnectedTask as Task
}
export default ConnectedTask
