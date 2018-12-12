import React from "react"
import { Dispatch } from "../../store"
import { ThunkDispatch } from "redux-thunk"
import { connect } from "react-redux"
import { createSelector } from "reselect"
import Swipeable from "react-swipeable"

import Remarkable from "remarkable"
import { GetGradientColor, getRandomBrightColor } from "../../util"
import { ClickableProgressBar } from "../ProgressBar/ProgressBar"
import {
    ITaskState,
    ITask,
    taskAdd,
    taskExpand,
    taskEdit,
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
    percentage: number
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
            percentage,
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
                styleName="taskHeader"
                style={{ left: slideLeft, paddingLeft: `${slideRight}px` }}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                // onClick={onClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onExpand}
            >
                <PriorityMarker priority={priority} />
                <StatusMarker isRecurring={isRecurring} />

                <div styleName="title">
                    <span style={{ color }}>{title}</span>
                    {percentage && <small className="marginLeft10">{`(${percentage}%)`}</small>}
                    {this.state.isHovering &&
                        (state === "completed" ? (
                            <div styleName="controls">
                                <a className={`material-icons`} onClick={onUncomplete}>
                                    restore
                                </a>
                            </div>
                        ) : (
                            <div styleName="controls">
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

const TaskEditableHeader = ({ isRecurring, priority, color, title, onTitleChange }) => {
    return (
        <div styleName="taskHeader">
            <PriorityMarker priority={priority} />
            <StatusMarker isRecurring={isRecurring} />

            <div styleName="title">
                <input style={{ color }} type="text" onChange={onTitleChange} name="title" value={title} />
            </div>
        </div>
    )
}

const EditableDescription = ({ description, onBodyChange, color, onColorChange, segmentDuration, onSegmentDurationChange, duration, onDurationChange, onSave }) => {
    return (
        <div styleName="desc_edit">
            <textarea name="descbody" onChange={onBodyChange} value={description} />
            
            <input
                styleName="shortInput"
                type="text"
                name="segment"
                onChange={onSegmentDurationChange}
                value={segmentDuration}
            />
            <input
                styleName="shortInput"
                type="text"
                name="duration"
                onChange={onDurationChange}
                value={duration}
            />
            <input styleName="shortInput" type="text" name="color" onChange={onColorChange} value={color} />
            <a styleName="save" onClick={onSave}>
                Save
            </a>
        </div>
    )
}

const EditableFlags = ({ onRerollColor, isRecurring, onToggleRecurring, isUrgent, onToggleUrgent, isImportant, onToggleImportant }) => {
    return (
        <div styleName="buttons">
            <a className={`material-icons ${"iconOn"}`} onClick={onRerollColor}>
                casino
            </a>
            <a
                className={`material-icons ${isRecurring ? "iconOn" : ""}`}
                onClick={onToggleRecurring}
            >
                autorenew
            </a>
            <a
                className={`material-icons ${isUrgent ? "iconOn" : ""}`}
                onClick={onToggleUrgent}
            >
                schedule
            </a>
            <a
                className={`material-icons ${isImportant ? "iconOn" : ""}`}
                onClick={onToggleImportant}
            >
                error_outline
            </a>
        </div>
    )
}

const NormalExpand = ({ description, onEdit }) => (
    <div styleName="expanded">
        <a className="paperButton stretch marginTop10 thinButton" onClick={onEdit}>Edit</a>
        <MarkdownView styleName="desc_view" source={description} />
    </div>
)


const EditableExpand = (props) => {
    const { description, onBodyChange, color, onColorChange, segmentDuration, onSegmentDurationChange, duration, onDurationChange, onSave } = props
    const { onRerollColor, isRecurring, onToggleRecurring, isUrgent, onToggleUrgent, isImportant, onToggleImportant } = props
    return (
        <div styleName="expanded">
            <EditableFlags
                onRerollColor={onRerollColor}
                isRecurring={isRecurring}
                onToggleRecurring={onToggleRecurring}
                isUrgent={isUrgent}
                onToggleUrgent={onToggleUrgent}
                isImportant={isImportant}
                onToggleImportant={onToggleImportant}
            />
            <EditableDescription
                description={description}
                onBodyChange={onBodyChange}
                color={color}
                onColorChange={onColorChange}
                onSave={onSave}
                segmentDuration={segmentDuration}
                onSegmentDurationChange={onSegmentDurationChange}
                duration={duration}
                onDurationChange={onDurationChange}
            />
        </div>
    )
}

const prioColors = [null, styles.priosvg_green, styles.priosvg_yellow, styles.priosvg_orange, styles.priosvg_red]
const PriorityMarker = ({ priority }) => {
    const color = prioColors[priority]
    return (
        <div styleName="priority">
            <svg className={color} viewBox="0 0 28.5 88" preserveAspectRatio="none">
                <polygon points="9.5,88 0,77.3 0,0 9.5,8.7 9.5,88" />
                <rect x="9.5" y="8.67" width="19" height="80" />
                <polygon points="9.5 8.67 28.5 8.67 19 0 0 0 9.5 8.67" />
            </svg>
        </div>
    )
}

const StatusMarker = ({ isRecurring }) => {
    if (isRecurring) return <div style={{ height: "100%", width: "2px", backgroundColor: "#040804" }} />
    else return null
}

interface ITaskProps extends ITask {
    dispatch: Dispatch
    flippedProps?: any
    isSelected: boolean
    onExpand: () => void
    onEdit: () => void
    onEditSubmit: (newData) => void
    onDelete: () => void
}
interface ITaskComponentState {
    title: string
    description: string
    priority: number
    color: string
    state: string
    segmentDuration: number
    duration: number
    isRecurring: boolean
    isHovering: boolean
    isImportant: boolean
    isUrgent: boolean
    xOffset: number
    paddingXOffset: number
}

const prioTable = [null, [false, false], [true, false], [false, true], [true, true]]

class Task extends React.Component<ITaskProps, ITaskComponentState> {
    constructor(props) {
        super(props)
        const [isUrgent, isImportant] = prioTable[props.priority]
        this.state = {
            title: props.title,
            description: props.description,
            priority: props.priority,
            color: props.color,
            state: props.state,
            segmentDuration: props.segmentDuration,
            duration: props.duration,
            isRecurring: props.isRecurring,
            isHovering: false,
            isImportant: isUrgent,
            isUrgent: isImportant,
            xOffset: 0,
            paddingXOffset: 0
        }

        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleBodyChange = this.handleBodyChange.bind(this)
        this.handleColorChange = this.handleColorChange.bind(this)
        this.handlePriorityChange = this.handlePriorityChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        // this.handleMouseEnter = this.handleMouseEnter.bind(this)
        // this.handleMouseLeave = this.handleMouseLeave.bind(this)
    }

    handleTitleChange(event) {
        this.setState({ title: event.target.value })
    }
    handleColorChange(event) {
        this.setState({ color: event.target.value })
    }
    handleBodyChange(event) {
        this.setState({ description: event.target.value })
    }

    calculatePriority(isUrgent: boolean, isImportant: boolean) {
        let prio = 1
        if (isUrgent && isImportant) prio = 4
        else if (isImportant) prio = 3
        else if (isUrgent && !isImportant) prio = 2
        this.setState({ priority: prio, isUrgent, isImportant })
    }

    handleToggleUrgent = () => {
        const { isUrgent, isImportant } = this.state
        return this.calculatePriority(!isUrgent, isImportant)
    }
    handleToggleImportant = () => {
        const { isUrgent, isImportant } = this.state
        return this.calculatePriority(isUrgent, !isImportant)
    }
    handleToggleRecurring = () => {
        const { isRecurring } = this.state
        return this.setState({ isRecurring: !isRecurring })
    }
    handleRerollColor = () => {
        this.setState({ color: getRandomBrightColor() })
    }

    handlePriorityChange(newPrio) {
        // this.setState({ priority: newPrio })
    }
    handleSegmentDurationChange = (event: React.FormEvent<HTMLInputElement>) => {
        const element = event.target as HTMLInputElement
        const newSD = element.value
        const value = parseInt(newSD, 10)

        if (value > 0 || element.value === "") {
            this.setState({
                segmentDuration: value
            })
        }
    }

    handleDurationChange = (event: React.FormEvent<HTMLInputElement>) => {
        const element = event.target as HTMLInputElement
        const newSD = element.value
        const value = parseInt(newSD, 10)

        if (value > 0 || element.value === "") {
            this.setState({
                duration: value
            })
        }
    }

    // handleTitleClick = (e: React.MouseEvent<any>) => {
    //     this.props.dispatch(taskSelect(this.props._id))
    // }

    handleTitleDoubleClick = (e?: React.MouseEvent<any>) => {
        this.props.dispatch(taskStart(this.props._id))
    }

    handleTitleContextMenu = (e?: React.MouseEvent<any>) => {
        e.preventDefault()

        this.props.dispatch(taskExpand(this.props._id))
        return false
    }
    

    handleSubmit(event) {
        event.preventDefault()
        const { _id } = this.props
        const newTaskData = { _id, ...this.state }

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
        this.props.dispatch(taskComplete(this.props._id))
    }
    uncompleteTask = (e?: React.MouseEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        this.props.dispatch(taskUncomplete(this.props._id))
    }
    startTask = (e?: React.MouseEvent<any>) => {
        e.preventDefault()
        e.stopPropagation()
        this.props.dispatch(taskStart(this.props._id))
    }

    render() {
        const { flippedProps, _id, description, progress, duration, isStarted, isSelected, priority, title, state, isRecurring } = this.props
        const { isExpanded, isEditing, color } = this.props
        const { onExpand, onEdit, onDelete } = this.props

        let percent
        if (progress > 0 && duration > 0) percent = (progress/duration*100).toFixed(0)

        // const priorityColor = GetGradientColor(this.state.priority / 100)
        // console.log("render task", this.props)
        return (
            <div styleName="task" className={isStarted ? "marginBottom30" : ""} {...flippedProps}>
                {isEditing ? (
                    <TaskEditableHeader
                        color={this.state.color}
                        title={this.state.title}
                        priority={this.state.priority}
                        isRecurring={this.state.isRecurring}
                        onTitleChange={this.handleTitleChange}
                    />
                ) : (
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
                            percentage={percent}
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
                )}

                {isExpanded && (
                    isEditing ?
                        <EditableExpand
                            onRerollColor={this.handleRerollColor}
                            isRecurring={this.state.isRecurring}
                            onToggleRecurring={this.handleToggleRecurring}
                            isUrgent={this.state.isUrgent}
                            onToggleUrgent={this.handleToggleUrgent}
                            isImportant={this.state.isImportant}
                            onToggleImportant={this.handleToggleImportant}

                            description={this.state.description}
                            onBodyChange={this.handleBodyChange}
                            color={this.state.color}
                            onColorChange={this.handleColorChange}
                            segmentDuration={this.state.segmentDuration}
                            onSegmentDurationChange={this.handleSegmentDurationChange}
                            duration={this.state.duration}
                            onDurationChange={this.handleDurationChange}
                            onSave={this.handleSubmit}
                        />
                        :
                        <NormalExpand description={description} onEdit={onEdit}/>
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
        bindUncompleteTask: () => {
            dispatch(taskExpand(props._id))
        },
        onExpand: () => {
            dispatch(taskExpand(props._id))
        },
        onEdit: () => {
            dispatch(taskEdit(props._id))
        },
        onEditSubmit: newData => {
            dispatch(taskSave(props._id, newData))
        },

        onDelete: () => {
            dispatch(taskDelete(props._id))
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
