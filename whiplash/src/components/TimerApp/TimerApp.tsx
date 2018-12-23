import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { PeriodicProgressBar } from '../ProgressBar/ProgressBar'
import { playSound } from  '../SoundPlayer/SoundPlayer'
import { ITimer, timerStart, timerStartNext, timerFinish, timerSetDuration, timerResetAll, timerResetCounter } from  './TimerAppActions'
import './TimerApp.scss'



interface ITimerProps {
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

interface ITimerState {
    duration: string
}

class TimerWithDuration extends React.Component<ITimerProps, ITimerState> {
    id: number
    dispatch: Dispatch
    soundID: number
    active: boolean


    constructor(props: any) {
        super(props)
        this.id = props.id
        this.dispatch = props.dispatch
        this.soundID = props.soundID
        this.state = {
            duration: props.duration
        }
        this.handleDurationChange = this.handleDurationChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.timerOnComplete = this.timerOnComplete.bind(this)
    }

    handleDurationChange(event: any) { // ChangeEvent isn't working
        event.preventDefault()
        const element: HTMLInputElement = event.target as HTMLInputElement
        const value = parseInt(element.value,10)
        
        if (value > 0 || element.value === "") {
            this.setState({
                duration: element.value
            })
        }

        if (value > 0) {
            this.props.onDurationChanged(this.id, value)
        }
    }

    protected timerOnComplete() {
        this.dispatch(timerFinish(this.id))
        this.dispatch(timerStartNext(this.id))
        // this.dispatch(playSound(this.soundID))
    }
    protected timerOnStart() {
        this.dispatch(playSound(this.soundID))
    }

    protected handleSubmit(event){
        event.preventDefault();
    }

    render() {
        const { text, active, startTime, duration, color, ...props } = this.props
        const { showCounter, count } = props

        if (!this.active && active) {
            this.timerOnStart()
        }
        this.active = active

        return (
            <form className="timer_form" onSubmit={this.handleSubmit}>
                <div className="timer" >
                    <PeriodicProgressBar
                        active={active}
                        onComplete={this.timerOnComplete}
                        startTime={startTime}
                        duration={duration}
                        color={color}
                    />
                </div>    
                <input type="text" onChange={this.handleDurationChange} value={this.state.duration}/>
                { showCounter && <div className="timer_counter"> {count}</div> }
            </form>
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
