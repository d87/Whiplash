import React, { useState, useRef, useEffect } from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { PeriodicProgressBar } from "../ProgressBar/ProgressBar"
import { mulColor, formatTimeHM } from "../../util"
import "./Timeline.scss"
import styled from "styled-components"
// import { isBrowser } from "../../../lib/isBrowser"
const isBrowser = true
import { getTaskEvents, subscribeToEventLog } from '../../api/api'

const StyledEventMark = styled.div`
    position: absolute;
    font-size: 0.6em;
    transform: translate(-20%, -50%) scale(1.5, 1);
    border-radius: 10px;
    z-index: 2;
`
const EventMark = (props) => {
    const s = props.startTime
    const elapsed = props.event.timestamp - s
    const p = (elapsed/props.duration*100).toFixed(1)
    return <StyledEventMark className="material-icons" style={{ top: p+"%", color: props.color }}>label</StyledEventMark>
}

const ScheduleRow = styled.div`
    grid-column: 2;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: #333333;
    color: #555555;
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

const lines = []
for (let i=0; i < 19; i++) {
    lines.push(i)
}
const workdayDuration = 20 * 3600
const dayStartHour = 8

let recheckTimeout: NodeJS.Timeout
let eventSubscription: ZenObservable.Subscription

const makeNewDayStartTimestamp = () => {
    const dayStart = new Date()
    dayStart.setHours(dayStartHour)
    dayStart.setMinutes(0)
    dayStart.setSeconds(0)

    let ts = dayStart.getTime()

    const date = new Date()
    if (date.getHours() < dayStartHour) {
        ts -= 24 * 3600 * 1000
    }

    return ts
}


const attemptShift = (events, i) => {
    const a = events[i]
    const b = events[i+1]
    if (b === undefined) return
    if (a.timestamp - b.timestamp < 13*60*1000) {
        attemptShift(events, i+1)
        b.timestamp = a.timestamp - 13*60*1000
    }
}
const spaceOutCloseMarks = (events: ITaskEvent[]) => {
    const sortedEvents = events.sort((a,b) => (b.timestamp - a.timestamp))
    for(let i=0;i < sortedEvents.length-1;i++) {
        attemptShift(events, i)
    }
    return sortedEvents
}

export const Timeline: React.FC<{}> = (props) => {
    const [events, setEventsState] = useState([])
    const [startTime, setStartTime] = useState(makeNewDayStartTimestamp)

    // setting a timeout to update startTime when next day begins
    useEffect(() => {
        if (isBrowser) {
            const now = Date.now()
            const nextDayStartTime = startTime + 24 * 3600 * 1000
            const untilNextDay = nextDayStartTime - now
            recheckTimeout = setTimeout(() => {
                setStartTime(makeNewDayStartTimestamp())
            }, untilNextDay)
        }

        // cleanup
        return () => {
            clearTimeout(recheckTimeout)
        }
    }, [startTime])

    const prevEventsRef = useRef(events)
    useEffect(() => {
        prevEventsRef.current = events
    }, [events])

    // fetching data and subscription hook
    useEffect(() => {
        getTaskEvents()
            .then(response => {
                const newEventsState = response.data.taskEvents
                setEventsState(spaceOutCloseMarks(newEventsState))
            })
            .catch(err => console.error(err))

        if (isBrowser) {
            const addEvent = (event: ITaskEvent) => {
                const newEventsState = [...prevEventsRef.current, event]
                setEventsState(spaceOutCloseMarks(newEventsState))
            }
            eventSubscription = subscribeToEventLog(addEvent)
        }

        return () => {
            if (isBrowser) eventSubscription.unsubscribe()
        }
    }, [])

    return (
        <div className="timelineGrid">
            <div className="timelineBar">
                <PeriodicProgressBar
                    active={true}
                    orientation="vertical"
                    startTime={startTime}
                    duration={workdayDuration}
                    interval={10000}
                    boxShadow={"0px 0px 6px 4px rgba(0,0,0,0.75)"}
                    color={"#880088"}
                />
                <div>
                    {events
                        .filter(event => event.timestamp >= startTime)
                        .map( (event) => (
                            <EventMark key={event.timestamp} event={event} color={event.color} startTime={startTime} duration={workdayDuration*1000}>
                            </EventMark>
                    ))}
                </div>
            </div>

            {lines.map((val, index) => (
                <ScheduleRow key={index} style={{ gridRow: index + 1 }}>
                    <ScheduleTimestamp>{formatTimeHM(dayStartHour * 3600 + (index + 1) * 3600)}</ScheduleTimestamp>
                </ScheduleRow>
            ))}
        </div>
    )
}
