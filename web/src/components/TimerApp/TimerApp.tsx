import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { PeriodicProgressBar } from '../ProgressBar/ProgressBar'
import { playSound } from  '../SoundPlayer/SoundPlayer'
import { ITimer, timerStart, timerStartNext, timerFinish, timerSetDuration, timerResetAll, timerResetCounter } from  './TimerAppActions'
import './TimerApp.scss'
import { NumericInput } from "../NumericInput/NumericInput"
import { VolumeControl } from "../SoundPlayer/SoundPlayer"


interface ITimerProps {
    dispatch: Dispatch
    id: number
    soundID?: number
    text?: string
    showCounter?: boolean
    count?: number
    startTime: number
    duration: number
    active: boolean
    color: string
    onDurationChanged?: (id: number, value: number) => void
}

class TimerWithDuration extends React.Component<ITimerProps> {
    componentDidUpdate(prevProps, prevState, snapshot) {
        const { active } = this.props
        if (!prevProps.active && active) {
            this.timerOnStart()
        }
    }    

    handleDurationChange = (value) => {
        this.props.onDurationChanged(this.props.id, value)
    }

    timerOnComplete = () => {
        this.props.dispatch(timerFinish(this.props.id))
        this.props.dispatch(timerStartNext(this.props.id))
    }

    timerOnStart() {
        if (this.props.soundID) {
            playSound(this.props.soundID)
        } 
    }

    render() {
        const { text, active, startTime, duration, color, ...props } = this.props
        const { showCounter, count } = props

        return (
            <div className="timer_form">
                <div className="timer" >
                    <PeriodicProgressBar
                        active={active}
                        onComplete={this.timerOnComplete}
                        startTime={startTime}
                        duration={duration}
                        color={color}
                    />
                </div>
                <NumericInput onChange={this.handleDurationChange} min={1} max={100} value={duration}/>
                {/* <input type="text" onChange={this.handleDurationChange} value={this.state.duration}/> */}
                { showCounter && <div className="timer_counter"> {count}</div> }
            </div>
        )
    }
}




interface ITimerAppProps {
    dispatch: Dispatch
    timers: ITimer[]
}

class TimerApp extends React.Component<ITimerAppProps> {
    private dispatch: Dispatch;

    constructor(props) {
        super(props);
        this.dispatch = props.dispatch
        // this._id = props.id
        this.state = {
            timers: []
        }

        
    }

    

    render() {
        const { timers } = this.props
        const dispatch = this.props.dispatch

        return (
            <div>
                <VolumeControl />
                {timers.map(timer => (
                    <TimerWithDuration key={timer.id} {...timer} {...this.props} />
                ))}
                <div className="timer_buttons">
                    <a onClick={() => dispatch(timerStart(1))}>
                        Start
                    </a>
                    <a onClick={() => dispatch(timerResetAll())}>
                        Stop
                    </a>
                    <a onClick={() => dispatch(timerResetCounter())}>
                        Reset
                    </a>
                </div>
            </div>
        )
    }
}

// Connecting

const mapStateToProps = (state, props) => {
    return {
        timers: state.timers.list
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,

        onDurationChanged: (timerID, newDuration) => {
            dispatch(timerSetDuration(timerID, newDuration))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimerApp)
