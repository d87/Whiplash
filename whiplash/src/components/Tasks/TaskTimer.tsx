import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { createSelector } from "reselect"
import { ITask, taskStopAndAddProgress, taskStop } from "../Tasks/TaskActions"
import { MiniDaemon, formatTimeRemains, formatTimeMS } from '../../util'
import { playSound } from "../SoundPlayer/SoundPlayer";
import "./TaskTimer.scss"

interface ITaskTimerState {
    percCompleted: number
    remains: number
    isPaused: boolean
    opacity: number
}
interface ITaskTimerProps extends ITask {
    dispatch: Dispatch
    onComplete: (id, duration) => void
    onStop: (id) => void
}

const ProgressRing = ({ color, value }) => (
    <svg viewBox="0 0 100 100">
        <path d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93" stroke="#222222" strokeWidth="1" fillOpacity="0"></path>
        <path d="M 50,50 m 0,-46.5 a 46.5,46.5 0 1 1 0,93 a 46.5,46.5 0 1 1 0,-93" stroke={ color } strokeWidth="7" fillOpacity="0" strokeDasharray="292.209, 292.209" strokeDashoffset={ 292.209 - 292.209*value }></path>
    </svg>
)

const TimeText = ({ time, formatFunc }) => <span>{ formatFunc(time) }</span>

class TaskTimer extends React.Component<ITaskTimerProps, ITaskTimerState> {
    protected timer: MiniDaemon
    protected isStarted: boolean
    protected startTime: number
    protected duration: number
    protected onComplete: any
    protected pausedAt: number
    protected pausedTime: number
    // protected progressPathRef: React.Ref<any>

    constructor(props) {
        super(props);
        const sD = props.segmentDuration > 0 && props.segmentDuration
        this.duration = (sD || props.duration) * 1000
        this.startTime = props.startTime
        this.isStarted = props.isStarted
        this.pausedAt = 0
        this.pausedTime = 0
        this.state = {
            percCompleted: 0,
            remains: 0,
            isPaused: false,
            opacity: 0,
        }
        // this.progressPathRef = React.createRef();

        this.onComplete = this.props.onComplete
    }

    handleStop = (e: React.MouseEvent<any>) => {
        e.preventDefault()
        this.props.onStop(this.props._id)
    }

    handlePause = (e: React.MouseEvent<any>) => {
        e.preventDefault()
        const pausedNow = !this.state.isPaused

        const now = Date.now()
        if (pausedNow) {
            this.pausedAt = now
        } else {
            const newPauseBlock = now - this.pausedAt 
            this.pausedTime += newPauseBlock
        }

        this.setState({
            isPaused: pausedNow
        })
    }

    componentWillMount() {
        this.timer = new MiniDaemon(null, this.update.bind(this), 100, Infinity)
        this.timer.pause()
        this.setState({ opacity: 0 })
    }

    componentWillUnmount() {
        this.timer.pause()
    }

    update() {
        if ( this.isStarted !== true){
            this.timer.pause()
            this.setState({ percCompleted: 0 })
            return 
        }

        let co = this.state.opacity
        if (co !== 1) {
            co += 0.15
            if (co > 1) co = 1
        }

        const now = Date.now()

        let pausedTime = this.pausedTime
        if (this.state.isPaused) {
            pausedTime += now - this.pausedAt
            return // !!!!
        }

        const elapsed = now - (this.startTime + pausedTime)
        let p
        let remains
        if (this.duration > 0) {
            p = elapsed / this.duration
            remains = this.duration - elapsed
            if (remains <= 0) remains = 0;
            if (p>=1) {
                p = 1;
            }
        } else {
            remains = elapsed
            p = 0.75
        }

        // this.progressPathRef.current.setAttribute("stroke-dashoffset", 292.209 - 292.209*p)
        this.setState({ percCompleted: p, remains, opacity: co })

        if (p === 1) {
            this.onComplete(this.props._id, this.duration/1000)
            this.timer.pause()
        }
    }

    render() {
        const { startTime, duration, segmentDuration, isStarted, color } = this.props
        this.startTime = startTime
        const sD = segmentDuration > 0 && segmentDuration
        const d = (sD || duration) * 1000
        this.duration = d
        this.isStarted = isStarted

        const formatFunc = (d>0) ? formatTimeRemains : formatTimeMS

        if ( isStarted === true){
            this.timer.resume()
        }
        const { percCompleted, remains, isPaused, opacity } = this.state

        return (
                <div className={`clock`} style={{ opacity }}>
                    <ProgressRing color={color} value={percCompleted} />
                    
                    <div className="clockControls">
                        <TimeText time={remains/1000} formatFunc={formatFunc} />
                        {/* <span>{ formatTime(remains/1000) }</span> */}
                        <a className={"material-icons clickable xlText"} onClick={this.handlePause}>{isPaused ? "play_circle_filled" : "pause_circle_filled"}</a>
                        <a className={"material-icons clickable xlText"} onClick={this.handleStop}>cancel</a>
                        {isPaused && <small>Paused</small>}
                    </div>
                </div>
        )
    }
}


const ConnectedTaskTimer = connect(
    null,
    (dispatch) => ({
        onComplete(id, duration) {
            dispatch(taskStopAndAddProgress(id, duration))
            dispatch(playSound("abolish"))
        },
        onStop(id) {
            dispatch(taskStop(id))
        }
    })
)(TaskTimer)


export {
    ConnectedTaskTimer as TaskTimer
}