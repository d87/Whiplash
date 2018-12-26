import React from "react"
import { isIntegerNumericCharacter } from "../../util"
import "./NumericInput.scss"

interface INumeritInputProps {
    value: number|string
    min?: number
    max?: number
    rollover?: boolean
    zerofill?: number
    speedUp?: boolean
    onChange: (value: number) => void
}

export class NumericInput extends React.Component<INumeritInputProps> {
    private static CONTINUOUS_CHANGE_DELAY = 300;
    private static CONTINUOUS_CHANGE_INTERVAL = 50;

    private timeout: NodeJS.Timeout
    private interval: number
    private delta: number = 0
    private step: number = 1
    private continuousChangeCounter: number = 0

    constructor(props) {
        super(props)
    }

    handleKeyPress = (e) => {
        if (!isIntegerNumericCharacter(e.key)) {
            e.preventDefault()
        }
    }

    handleChange = (e) => {
        this.props.onChange(e.target.value)
    }

    handleIncrement = (e) => {
        e.preventDefault()
        this.delta = this.step
        this.incrementValue(this.delta)
        this.continuousChangeCounter = 1
        this.startContinuousChange()
    }
    handleDecrement = (e) => {
        e.preventDefault()
        this.delta = -this.step
        this.incrementValue(this.delta)
        this.continuousChangeCounter = 1
        this.startContinuousChange()
    }
    handleBlur = (e) => {
        if (this.props.value === "")
            this.props.onChange(this.props.min)
    }

    private incrementValue(delta: number) {
        // pretend we're incrementing from 0 if currValue is empty
        const currValue = parseInt(this.props.value || "0", 10);
        let nextValue = currValue + delta;
        const { min, max, rollover } = this.props
        if (max !== undefined && nextValue > max)
            nextValue = (min !== undefined && rollover) ? min : max
        if (min !== undefined && nextValue < min)
            nextValue = (max !== undefined && rollover) ? max : min

        this.props.onChange(nextValue)

        return nextValue;
    }

    private startContinuousChange() {
        // The button's onMouseUp event handler doesn't fire if the user
        // releases outside of the button, so we need to watch all the way
        // from the top.
        document.addEventListener("mouseup", this.stopContinuousChange);

        // Initial delay is slightly longer to prevent the user from
        // accidentally triggering the continuous increment/decrement.
        this.timeout = setTimeout(() => {
            this.interval = window.setInterval(this.handleContinuousChange, NumericInput.CONTINUOUS_CHANGE_INTERVAL);
        }, NumericInput.CONTINUOUS_CHANGE_DELAY);
    }

    private stopContinuousChange = () => {
        this.delta = 0;
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = undefined
        if (this.interval) clearInterval(this.interval);
        this.interval = undefined
        document.removeEventListener("mouseup", this.stopContinuousChange);
    };

    private handleContinuousChange = () => {
        const nextValue = this.incrementValue(this.delta);
        this.continuousChangeCounter++;
        if (this.props.speedUp) {
            if (this.continuousChangeCounter === 5) {
                this.delta = this.delta * 5
            }
            if (this.continuousChangeCounter === 16) {
                this.delta = this.delta * 2
            }
        }
    };

    render() {
        const { value, zerofill } = this.props
        const value2 = (zerofill) ? value.toString().padStart(zerofill, '0').slice(-zerofill) : value

        return (<div className="wl-numeric-input">
            <input className="wl-numeric-input-text" onKeyPress={this.handleKeyPress} onBlur={this.handleBlur} onChange={this.handleChange} value={value2}/>
            <a className={`material-icons clickable wl-numeric-input-up flexCenter`} onMouseDown={this.handleIncrement}>keyboard_arrow_up</a>
            <a className={`material-icons clickable wl-numeric-input-down flexCenter`} onMouseDown={this.handleDecrement}>keyboard_arrow_down</a>
        </div>)
    }
}