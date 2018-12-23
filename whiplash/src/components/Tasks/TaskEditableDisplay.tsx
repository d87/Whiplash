import React from "react"
import { Formik } from "formik"
import { PriorityMarker, StatusMarker, calculatePriority } from "./Task"
import { ITask } from "./TaskActions"
import { getRandomBrightColor } from "../../util"
import "./Task.scss"
import { Button, TextArea, EditableText, NumericInput, INumericInputProps, Classes } from "@blueprintjs/core";

const TaskEditableHeader = ({ isRecurring, priority, color, title, onTitleChange }) => {
    return (
        <div className="taskHeader">
            <PriorityMarker priority={priority} />
            <StatusMarker isRecurring={isRecurring} />

            <div className="taskTitle">
                {/* <input style={{ color }} type="text" onChange={onTitleChange} name="title" value={title} /> */}
                
                <span style={{ color }}><EditableText intent="primary" maxLines={1} value={title} onChange={onTitleChange}/> </span>
            </div>
        </div>
    )
}

const EditableDescription = ({
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
    onSave,
    onCancel
}) => {
    return (
        <div className="taskDescriptionEdit">
            {/* <textarea name="description" onChange={onBodyChange} value={description} /> */}
            <TextArea onChange={onDescriptionChange} value={description} fill={true}/>

            <NumericInput  min={1} max={45} value={segmentDuration} onValueChange={onSegmentDurationChange} />
            <NumericInput  min={1} max={720} value={duration} onValueChange={onDurationChange} />
            {/* <input type="text" name="duration" onChange={onDurationChange} value={duration} /> */}
            <input type="text" className={Classes.INPUT} name="color" onChange={onColorChange} value={color} />
            {/* <input type="text" name="resetTime" onChange={onResetTimeChange} value={resetTime} /> */}
            <NumericInput  min={1} max={31} value={resetTime} onValueChange={onResetTimeChange} />
            <Button intent="none" text="Cancel" onClick={onCancel} />
            <Button intent="success" text="Save" onClick={onSave} />
            {/* <a className="taskSave" onClick={onSave}>
                Save
            </a> */}
        </div>
    )
}

const EditableFlags = ({
    onRerollColor,
    isRecurring,
    onToggleRecurring,
    isUrgent,
    onToggleUrgent,
    isImportant,
    onToggleImportant
}) => {
    return (
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
    )
}

const EditableExpand = props => {
    // const { description, onBodyChange, color, onColorChange, segmentDuration, onSegmentDurationChange, duration, onDurationChange, onSave } = props
    // const { onRerollColor, isRecurring, onToggleRecurring, isUrgent, onToggleUrgent, isImportant, onToggleImportant } = props
    return (
        <div className="taskExpanded">
            <EditableFlags {...props} />
            <EditableDescription {...props} />
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
    resetTime: number
    segmentDuration: number
    isRecurring: boolean
    isHovering: boolean
    isImportant: boolean
    isUrgent: boolean
}
const prioTable = [null, [false, false], [true, false], [false, true], [true, true]]
export class EditableTask extends React.Component<IEditableTaskProps, IEditableTaskState> {
    constructor(props) {
        super(props)
        const task = this.props.task
        const [isUrgent, isImportant] = prioTable[task.priority]
        this.state = {
            priority: task.priority,
            title: task.title,
            description: task.description,
            color: task.color,
            duration: task.duration,
            segmentDuration: task.segmentDuration,
            resetTime: task.resetTime,
            isRecurring: task.isRecurring,
            isHovering: false,
            isImportant: isUrgent,
            isUrgent: isImportant,
        }
    }

    handleSubmit = (event: React.FormEvent<any>) => {
        event.preventDefault()
        return this.props.onSubmit(this.state)
    }

    handleTitleChange = (title: string) => {
        this.setState({ title })
    }
    handleColorChange = (event) => {
        this.setState({ color: event.target.value })
    }
    handleDescriptionChange = (event) => {
        this.setState({ description: event.target.value })
    }
    handleDurationChange = (valueNum: number) => {
        this.setState({ duration: valueNum })
    }
    handleSegmentDurationChange = (valueNum: number) => {
        this.setState({ segmentDuration: valueNum })
    }
    handleResetTimeChange = (valueNum: number, valueStr: string) => {
        // this.setState({ resetTime: event.target.value })
        this.setState({ resetTime: valueNum })
    }

    handleToggleUrgent = () => {
        const { isUrgent, isImportant } = this.state
        const prio = calculatePriority(!isUrgent, isImportant)
        this.setState({ priority: prio, isUrgent: !isUrgent, isImportant })
    }
    handleToggleImportant = () => {
        const { isUrgent, isImportant } = this.state
        const prio = calculatePriority(!isUrgent, isImportant)
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
