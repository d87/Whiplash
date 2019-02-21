import React, { useState, useEffect } from "react"
import { Dispatch } from "redux"
import { MiniDaemon, mulColor } from "../../util"
import { isBrowser } from "../../../lib/isBrowser"
import styled from "styled-components"

const Background = styled.div`
    height: 100%;
    width: 100%;
    border-radius: 5px;
    background-color: ${props => mulColor(props.color, 0.4)};
    position: relative;
`

const Foreground = styled.div`
    height: 100%;
    width: 100%;
    border-radius: 5px;
    background-color: ${props => props.color};
    position: absolute;
    ${props => {
        const orientation = props.orientation
        const attachPoint = props.attachPoint || "top"

        if (orientation === "vertical" && attachPoint === "top")
            return `
                top: 0px;
                left: 0px;
            `
        else
            return `
                bottom: 0px;
                left: 0px;
            `
    }}
`

const StyledText = styled.span`
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%;
`

export const ProgressBar = props => {
    const { value, color, orientation, attachPoint, text } = props
    const barStyle = orientation === "vertical" ? { height: `${value}%` } : { width: `${value}%` }

    return (
        <Background color={color} draggable={true} onMouseDown={props.onMouseDown}>
            <Foreground color={color} style={barStyle} orientation={orientation} attackPoint={attachPoint} />
            {typeof text !== "undefined" && <StyledText>{text}</StyledText>}
        </Background>
    )
}

const getXY = (obj?: HTMLElement) => {
    if (!obj) return [0, 0]

    let left = 0
    let top = 0
    let pos
    if (obj.offsetParent) {
        do {
            left += obj.offsetLeft
            top += obj.offsetTop
            pos = obj.style.position
            if (pos === "fixed" || pos === "absolute" || pos === "relative") {
                left -= obj.scrollLeft
                top -= obj.scrollTop
            }
            obj = obj.offsetParent as HTMLElement
        } while (obj)
    }
    return [left, top]
}

export interface IProgressBarProps {
    color?: string
    value?: number
    text?: string
    orientation?: string
    onMouseDown?: (e: any) => void
}

export interface IClickableProgressBarProps extends IProgressBarProps {
    onChange: (value: number) => void
}

export class ClickableProgressBar extends React.Component<IClickableProgressBarProps> {
    private dragArea: HTMLElement
    private dragElement: HTMLElement

    constructor(props) {
        super(props)

        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
    }

    private setValue(val) {
        let p = 100 * val
        if (p > 100) {
            p = 100
        }
        if (p < 0) {
            p = 0
        }
        this.props.onChange(p)
    }

    private barClick(e) {
        e.preventDefault()
        const el = this.dragElement as any
        const ex = el._globaloffsetX || getXY(el)[0]
        el._globaloffsetX = ex
        const val = e.clientX - ex
        const width = el.offsetWidth
        const p = val / width

        this.setValue(p)
    }

    private handleMouseDown(e: React.MouseEvent<HTMLElement>) {
        this.dragElement = e.currentTarget as HTMLElement
        this.dragArea = this.dragElement.parentNode.parentNode.parentNode.parentNode as HTMLElement
        this.barClick(e)
        this.dragArea.addEventListener("mousemove", this.handleMouseMove)
        this.dragArea.addEventListener("mouseup", this.handleMouseUp)
    }

    private handleMouseMove(e: MouseEvent) {
        // DOM MouseEvent and react mouse event are different
        return this.barClick(event)
    }

    private handleMouseUp(event?: MouseEvent) {
        if (this.dragArea) {
            this.dragArea.removeEventListener("mousemove", this.handleMouseMove)
            this.dragArea.removeEventListener("mouseup", this.handleMouseUp)
        }
        this.dragElement = null
    }

    componentWillUnmount() {
        return this.handleMouseUp()
    }

    render() {
        return <ProgressBar onMouseDown={this.handleMouseDown} {...this.props} />
    }
}

interface IPeriodicProgressBarProps extends IProgressBarProps {
    startTime?: number
    duration?: number
    active?: boolean
    interval?: number
    onComplete?: () => void
}

interface IPeriodicProgressBarState {
    progress: number
}

export class PeriodicProgressBar extends React.Component<IPeriodicProgressBarProps, IPeriodicProgressBarState> {
    private normalTimer: MiniDaemon
    private active: boolean
    private onComplete: () => void
    startTime: number
    duration: number

    constructor(props) {
        super(props);

        const { startTime, duration, active } = this.props
        this.startTime = startTime
        this.duration = duration * 1000
        this.active = active
        this.onComplete = props.onComplete
        this.state = { progress: 0 }
    }

    componentWillMount() {
        const interval = this.props.interval || 50
        if (isBrowser) {
            this.normalTimer = new MiniDaemon(null, this.update.bind(this), interval, Infinity)
            this.normalTimer.pause();
        }
        this.update()
    }

    componentWillUnmount() {
        if (isBrowser) {
            this.normalTimer.pause()
        }
    }

    update() {
        if ( this.active !== true){
            if (this.normalTimer) this.normalTimer.pause()
            this.setState({ progress: 0 })
            return
        }

        const now = Date.now()
        const elapsed = now - this.startTime
        // if (this.startTime === undefined) elapsed = 0;
        let p = elapsed / this.duration
        let remains = this.duration - elapsed
        if (remains <= 0) remains = 0;
        // console.log(elapsed, this.taskSyncPeriod, this.startTime)
        if (p>=1) {
            p = 1;
        }
        this.setState({ progress: p*100 })

        if (p === 1 && this.onComplete) {
            this.onComplete()
        }
    }

    render() {
        const { startTime, duration, active } = this.props
        this.startTime = startTime
        this.duration = duration * 1000
        this.active = active

        if ( active === true && isBrowser){
            this.normalTimer.resume()
        }

        const progress = this.state.progress
        return <ProgressBar value={progress} {...this.props}/>
    }
}

// function useInterval(callback, delay) {
//     const savedCallback = useRef()

//     // Remember the latest callback.
//     useEffect(() => {
//         savedCallback.current = callback
//     })

//     // Set up the interval.
//     useEffect(() => {
//         function tick() {
//             savedCallback.current()
//         }
//         if (delay !== null) {
//             let id = setInterval(tick, delay)
//             return () => clearInterval(id)
//         }
//     }, [delay])
// }


// function useIntervalSimple(callback, delay) {
//     // Set up the interval.
//     useEffect(() => {
//         if (delay !== null) {
//             const id = setInterval(callback, delay)
//             return () => clearInterval(id)
//         }
//     }, [delay])
// }