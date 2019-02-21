import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { PeriodicProgressBar } from "../ProgressBar/ProgressBar"
import { mulColor, formatTimeHM } from "../../util"
import "./Timeline.scss"
import styled from "styled-components"
import { isBrowser } from "../../../lib/isBrowser"
import { getTaskEvents, eventSubscriptionQuery } from '../../api/api'

const StyledEventMark = styled.div`
    position: absolute;

    height: 2px;
    width: 2px;
    background-color: #FFFFFF;
    transform: translate(-35%, -50%);
    border-radius: 10px;
    z-index: 2;
`
const EventMark = (props) => {
    const s = props.startTime
    const elapsed = props.event.timestamp - s
    const p = (elapsed/props.duration*100).toFixed(1)
    return <StyledEventMark style={{top: p+"%"}}/>
}


const ScheduleRow = styled.div`
    grid-column: 2;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #111111;
    color: #333333;
    padding-right: 0.5em;
    position: relative;
`
const ScheduleTimestamp = styled.span`
    position: absolute;
    bottom: 2px;
    font-size: 0.7em;
    right: 5px;
`

export interface ITaskEvent {
    timestamp: number
    title: string
    color: string
}

interface ITimelineProps {
    dispatch: Dispatch
    // events: ITaskEvent[]
}

interface ITimelineState {
    events: ITaskEvent[]
    active: boolean
    startTime: number
}

const lines = [...Array(20).keys()]
const workdayDuration = 20 * 3600
const dayStartHour = 8
class Timeline extends React.Component<ITimelineProps, ITimelineState> {
    dayStartTimestamp: number
    recheckTimeout: NodeJS.Timeout
    eventSubscription: ZenObservable.Subscription

    state: ITimelineState = {
        active: true,
        events: [],
        startTime: 0
    }
    constructor(props) {
        super(props)
    }

    componentWillMount() {
        const dayStartTimestamp = this.updateDayStartTimestamp()
        if (isBrowser) {
            const now = Date.now()
            const nextDayStartTime = dayStartTimestamp + 24 * 3600 * 1000
            const untilNextDay = nextDayStartTime - now
            this.recheckTimeout = setTimeout(this.updateDayStartTimestamp, untilNextDay)
        }
    }

    addEvent = (event) => {
        this.setState({
            events: [...this.state.events, event]
        })
    }

    componentDidMount() {
        if (isBrowser) {
            const self = this
            this.eventSubscription = eventSubscriptionQuery().subscribe({
                next(message) {
                    const event = message.data.eventLog
                    console.log("eventlog observer got data", event)
                    self.addEvent(event)
                },
                error(err) { console.error('err', err); },
            });
        }

        getTaskEvents()
            .then(response => {
                this.setState({
                    events: response.data.taskEvents
                })
            })
            .catch(err => console.error(err))
    }

    componentWillUnmount() {
        if (isBrowser) {
            clearTimeout(this.recheckTimeout)
            this.eventSubscription.unsubscribe()
        }
    }

    updateDayStartTimestamp = () => {
        const dayStart = new Date()
        dayStart.setHours(dayStartHour)
        dayStart.setMinutes(0)
        dayStart.setSeconds(0)

        let dayStartTimestamp = dayStart.getTime()

        const date = new Date()
        if (date.getHours() < dayStartHour) {
            dayStartTimestamp -= 24 * 3600 * 1000
        }

        this.setState({ startTime: dayStartTimestamp })
        return dayStartTimestamp
    }

    render() {
        const events = this.state.events
        const dayStartTimestamp = this.state.startTime
        return (
            <div className="timelineGrid">
                <div className="timelineBar">
                    <PeriodicProgressBar
                        active={true}
                        orientation="vertical"
                        startTime={dayStartTimestamp}
                        duration={workdayDuration}
                        interval={10000}
                        color={"#880088"}
                    />
                    <div>
                        {events
                            .filter(event => event.timestamp >= dayStartTimestamp)
                            .map( (event) => (
                                <EventMark key={event.timestamp} event={event} startTime={dayStartTimestamp} duration={workdayDuration*1000}>
                                </EventMark>
                        ))}
                    </div>
                </div>

                {lines.map(index => (
                    <ScheduleRow key={index} style={{ gridRow: index + 1 }}>
                        <ScheduleTimestamp>{formatTimeHM(dayStartHour * 3600 + (index + 1) * 3600)}</ScheduleTimestamp>
                    </ScheduleRow>
                ))}
                {/* {tasks.map(task =>
                <TaskFieldAlt key={task.id} startTime={task.suggestedStartTime} duration={task.taskLength} title={task.title} color={task.color} />
            )} */}
            </div>
        )
    }
}


// const mapStateToProps = (state, props) => {
//     return {
//         events: state.tasks.events,
//     }
// }

// const mapDispatchToProps = (dispatch: Dispatch) => {
//     return {
//         dispatch,

//     }
// }



const ConnectedTimeline = Timeline // connect(mapStateToProps, mapDispatchToProps)(Timeline)

export {
    ConnectedTimeline as Timeline
}
export default ConnectedTimeline