import React from "react"
import { PriorityMarker, StatusMarker, calculatePriority } from "./Task"
import { ITask } from "./TaskActions"
import { getRandomBrightColor, isIntegerNumericCharacter, getHoursFromSeconds, getMinutesFromSeconds } from "../../util"
import { NumericInput } from "../NumericInput/NumericInput"
import DayPicker from "react-day-picker"
import "react-day-picker/lib/style.css"
import { Manager, Reference, Popper, ReferenceChildrenProps } from "react-popper"
import "./Task.scss"
import { dueInDays, RESET_HOUR, RESET_MINUTE } from './TaskList'


const TaskEditableHeader = ({ isRecurring, priority, color, title, onTitleChange }) => {
    return (
        <div className="taskHeader">
            <PriorityMarker priority={priority} />
            <StatusMarker isRecurring={isRecurring} />

            <div className="taskTitle">
                <input style={{ color }} type="text" onChange={onTitleChange} name="title" value={title} />

                {/* <span style={{ color }}><EditableText intent="primary" maxLines={1} value={title} onChange={onTitleChange}/> </span> */}
            </div>
        </div>
    )
}
class Example extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.targetRef = React.createRef()
        this.popoverRef = React.createRef()
    }

    private renderTarget = (referenceProps: ReferenceChildrenProps) => {
        const { openOnTargetFocus, targetClassName, targetProps = {}, targetTagName: TagName } = this.props;
        // const { isOpen } = this.state;
        // const isHoverInteractionKind = this.isHoverInteractionKind();
    };

    handleTargetClick = (e) => {
        console.log("target Click")
        this.setState({ isOpen: !this.state.isOpen })
    }

    render() {
        return (
            <Manager>
                <Reference innerRef={(ref) => {this.targetRef = ref}}>
                    {({ ref }) => (
                        <button type="button" ref={ref} onClick={this.handleTargetClick}>
                            Reference element
                        </button>
                    )}
                </Reference>
                <Popper placement="right">
                    {({ ref, style, placement, arrowProps }) => {
                        let finalStyle = style
                        if (!this.state.isOpen) {
                            finalStyle = { ...style, display: "none"}
                        }
                        return (
                            <div ref={ref} style={finalStyle} data-placement={placement}>
                                Popper element
                                <div ref={arrowProps.ref} style={arrowProps.style} />
                            </div>
                        )
                    }}
                </Popper>
            </Manager>
        )
    }
}

const EditableExpand = props => {
    const {
        onRerollColor,
        isRecurring,
        onToggleRecurring,
        isUrgent,
        onToggleUrgent,
        isImportant,
        onToggleImportant
    } = props
    const {
        description,
        onDescriptionChange,
        color,
        onColorChange,
        resetTime,
        onResetTimeChange,
        segmentDuration,
        onSegmentDurationChange,
        duration,
        onDurationChange,
        dueDays,
        onDueDaysChange,
        onDueHoursChange, 
        dueHours,
        onDueMinutesChange, 
        dueMinutes,
        onSave,
        onCancel
    } = props
    return (
        <div className="taskExpanded">
            <div className="taskButtons">
                <a className={`material-icons ${"iconOn"}`} onClick={onRerollColor}>
                    casino
                </a>
                <a className={`material-icons ${isRecurring ? "iconOn" : ""}`} onClick={onToggleRecurring}>
                    autorenew
                </a>
                <a className={`material-icons ${isUrgent ? "iconOn" : ""}`} onClick={onToggleUrgent}>
                    schedule
                </a>
                <a className={`material-icons ${isImportant ? "iconOn" : ""}`} onClick={onToggleImportant}>
                    error_outline
                </a>
            </div>
            <div className="taskDescriptionEdit">
                <textarea name="description" onChange={onDescriptionChange} value={description} />
                {/* <TextArea onChange={onDescriptionChange} value={description} fill={true}/> */}

                {/* <input type="text" name="segmentDuration" onChange={onDurationChange} value={segmentDuration} />
                <input type="text" name="duration" onChange={onDurationChange} value={duration} /> */}
                <input type="text" name="color" onChange={onColorChange} value={color} />
                {/* <input type="text" name="resetTime" onChange={onResetTimeChange} value={resetTime} /> */}
                <div>
                    <label>Duration:</label>
                    <NumericInput onChange={onDurationChange} value={duration} max={1200} min={0} speedUp={true} />
                </div>
                {duration > "0" && (
                    <div>
                        <label>Segment:</label>
                        <NumericInput
                            onChange={onSegmentDurationChange}
                            value={segmentDuration}
                            max={1200}
                            min={0}
                            speedUp={true}
                        />
                    </div>
                )}
                {isRecurring && (
                    <div>
                        <label>Reset Every:</label>
                        <NumericInput onChange={onResetTimeChange} value={resetTime} max={31} min={1} />
                    </div>
                )}
                {isUrgent && (
                    <div>
                        <label>Due in N Days:</label>
                        <NumericInput onChange={onDueDaysChange} value={dueDays} max={31} min={0} />
                    </div>
                )}
                {isUrgent && (
                    <div>
                        <label>Due Time:</label>
                        <NumericInput onChange={onDueHoursChange} value={dueHours} max={23} min={0} rollover={true}/>
                        <span> : </span>
                        <NumericInput onChange={onDueMinutesChange} value={dueMinutes} max={59} min={0} zerofill={2} rollover={true} speedUp={true}/>
                    </div>
                )}

                <button className="paperButton mutedButton largeText" onClick={onCancel}>
                    Cancel
                </button>
                <button className="paperButton largeText" onClick={onSave}>
                    Save
                </button>
            </div>
        </div>
    )
}

interface IEditableTaskProps {
    task: ITask
    onSubmit: (values: object) => void
    onEditCancel: () => void
}

interface IEditableTaskState {
    priority: number
    title: string
    description: string
    color: string
    duration: number
    dueDays: number
    dueHours: number
    dueMinutes: number
    resetTime: number
    segmentDuration: number
    isRecurring: boolean
    isHovering: boolean
    isImportant: boolean
    isUrgent: boolean
}

const cleanInput = (value, def = 0) => {
    if (typeof value === "string") {
        return value === "" ? def : parseInt(value, 10)
    }
    return value
}

const dayLength = 24 * 3600 * 1000
const prioTable = [null, [false, false], [true, false], [false, true], [true, true]]
export class EditableTask extends React.Component<IEditableTaskProps, IEditableTaskState> {
    constructor(props) {
        super(props)
        const task = this.props.task
        const [isUrgent, isImportant] = prioTable[task.priority]
        const diffDays = dueInDays(task.dueDate)
        const dueHours = getHoursFromSeconds(task.dueTime)
        const dueMinutes = getMinutesFromSeconds(task.dueTime)
        
        console.log("got time: ", task.dueTime, dueHours, dueMinutes)

        this.state = {
            priority: task.priority,
            title: task.title,
            description: task.description,
            color: task.color,
            duration: task.duration,
            segmentDuration: task.segmentDuration,
            resetTime: task.resetTime,
            dueHours: dueHours,
            dueMinutes: dueMinutes,
            dueDays: diffDays,
            isRecurring: task.isRecurring,
            isHovering: false,
            isImportant: isImportant,
            isUrgent: isUrgent
        }
    }

    handleSubmit = (event: React.FormEvent<any>) => {
        event.preventDefault()
        const data: any = { ...this.state }
        data.duration = cleanInput(data.duration)
        data.segmentDuration = cleanInput(data.duration)
        data.resetTime = cleanInput(data.resetTime, 1)
        const dueDays = cleanInput(data.dueDays, 0)
        const d = new Date()
        d.setDate(d.getDate()+dueDays)
        d.setHours(RESET_HOUR)
        d.setMinutes(RESET_MINUTE)
        data.dueDate = d.getTime()

        data.dueTime = (data.dueHours * 60 + data.dueMinutes) * 60
        return this.props.onSubmit(data)
    }

    handleTitleChange = event => {
        this.setState({ title: event.target.value })
    }
    handleColorChange = event => {
        this.setState({ color: event.target.value })
    }
    handleDescriptionChange = event => {
        this.setState({ description: event.target.value })
    }
    handleDurationChange = (value: number) => {
        this.setState({ duration: value })
    }
    handleSegmentDurationChange = (value: number) => {
        this.setState({ segmentDuration: value })
    }
    handleDueDaysChange = (value: number) => {
        this.setState({ dueDays: value })
    }
    handleDueHoursChange = (value: number) => {
        this.setState({ dueHours: value })
    }
    handleDueMinutesChange = (value: number) => {
        this.setState({ dueMinutes: value })
    }
    handleResetTimeChange = (value: number) => {
        // this.setState({ resetTime: event.target.value })
        this.setState({ resetTime: value })
    }

    handleToggleUrgent = () => {
        const { isUrgent, isImportant } = this.state
        const prio = calculatePriority(!isUrgent, isImportant)
        this.setState({ priority: prio, isUrgent: !isUrgent, isImportant })
    }
    handleToggleImportant = () => {
        const { isUrgent, isImportant } = this.state
        const prio = calculatePriority(isUrgent, !isImportant)
        this.setState({ priority: prio, isUrgent, isImportant: !isImportant })
    }
    handleToggleRecurring = () => {
        const { isRecurring } = this.state
        return this.setState({ isRecurring: !isRecurring })
    }
    handleRerollColor = () => {
        this.setState({ color: getRandomBrightColor() })
    }

    render() {
        const { task, onSubmit, onEditCancel } = this.props
        const values = this.state
        return (
            <form onSubmit={onSubmit}>
                <TaskEditableHeader
                    color={values.color}
                    title={values.title}
                    priority={this.state.priority}
                    isRecurring={this.state.isRecurring}
                    onTitleChange={this.handleTitleChange}
                />
                <EditableExpand
                    onRerollColor={this.handleRerollColor}
                    isRecurring={this.state.isRecurring}
                    onToggleRecurring={this.handleToggleRecurring}
                    isUrgent={this.state.isUrgent}
                    onToggleUrgent={this.handleToggleUrgent}
                    isImportant={this.state.isImportant}
                    onToggleImportant={this.handleToggleImportant}
                    description={values.description}
                    onDescriptionChange={this.handleDescriptionChange}
                    color={values.color}
                    onColorChange={this.handleColorChange}
                    segmentDuration={values.segmentDuration}
                    onSegmentDurationChange={this.handleSegmentDurationChange}
                    duration={values.duration}
                    dueDays={values.dueDays}
                    onDueDaysChange={this.handleDueDaysChange}
                    dueHours={values.dueHours}
                    onDueHoursChange={this.handleDueHoursChange}
                    dueMinutes={values.dueMinutes}
                    onDueMinutesChange={this.handleDueMinutesChange}
                    onDurationChange={this.handleDurationChange}
                    resetTime={values.resetTime}
                    onResetTimeChange={this.handleResetTimeChange}
                    onSave={this.handleSubmit}
                    onCancel={onEditCancel}
                />
            </form>
        )
    }
}
