import React from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import { PeriodicProgressBar } from "../ProgressBar/ProgressBar"
import { mulColor, formatTimeHM } from "../../util"
import "./Timeline.scss"
import styled from "styled-components"
import { isBrowser } from "../../../lib/isBrowser"
const rowHeight = 15

// const TaskFieldAlt = ({ startTime, duration, color, title }) => {
//     const startHours = startTime / 1800
//     const durationHours = duration / 1800

//     const width = 160
//     const height = durationHours*rowHeight
//     const style = {
//         position: "absolute",
//         left: 0,
//         top: rowHeight*startHours,
//         height: height,
//         width: width,
//         // opacity: 0.1,
//         backgroundColor: mulColor(color, 0.4),
//         borderTopWidth: "2px",
//         borderBottomWidth: 0,
//         borderLeftWidth: 0,
//         borderRightWidth: 0,
//         borderStyle: "solid",
//         borderColor: color,
//     }

//     const textStyle = {
//         padding: 5,
//         color: color,
//         textAlign: "center",
//         fontWeight: "bold",
//         width: "100%",
//         position: "absolute",
//         left: "50%",
//         top: "50%",
//         transform: "translate(-50%, -50%)",
//         // backgroundColor: "#000"
//         // textShadowColor: "#000000",
//         // textShadowOffset: {width: -2, height: 2},
//         // textShadowRadius: 30
//     }

//     return (
//         <div style={style}>
//             <svg width={ width } height={ height } viewBox={[0, 0, width, height]}>

//                 <defs>
//                     <pattern id="hatchPattern" patternTransform="rotate(45 0 0)" width="4" height="4"
//                         patternUnits="userSpaceOnUse">
//                         <line x1={0} y1={0} x2={0} y2={20} style={{ stroke: "#000000", strokeWidth:5 }} />
//                     </pattern>
//                 </defs>

//                 <rect width={width} height={height-3} fill="url(#hatchPattern)"/>
//             </svg>
//             <span style={textStyle}>{title}</span>
//         </div>
//     )
// }

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

const lines = [...Array(20).keys()]
const dayStartHour = 8
export class Timeline extends React.Component {
    dayStartTimestamp: number
    recheckTimeout: NodeJS.Timeout
    state: object = {
        active: true,
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
    componentWillUnmount() {
        if (isBrowser) {
            clearTimeout(this.recheckTimeout)
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
        const workdayDuration = 20 * 3600
        return (
            <div className="timelineGrid">
                <div className="timelineBar">
                    <PeriodicProgressBar
                        active={true}
                        orientation="vertical"
                        startTime={this.state.startTime}
                        duration={workdayDuration}
                        interval={10000}
                        color={"#880088"}
                    />
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
