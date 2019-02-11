import React from 'react';
import { Dispatch } from 'redux'
import { MiniDaemon, mulColor } from '../../util'
import { isBrowser } from '../../../lib/isBrowser'
// import styles from "./ProgressBar.sass"

const getXY = (obj?: HTMLElement) => {
    if (!obj) return [0,0];

    let left = 0
    let top = 0
    let pos
    if (obj.offsetParent) {
        do {
            left += obj.offsetLeft
            top += obj.offsetTop;
            pos = obj.style.position
            if (pos === 'fixed' || pos === 'absolute' || (pos === 'relative')) {
                left -= obj.scrollLeft;
                top -= obj.scrollTop;

            }
            obj = obj.offsetParent as HTMLElement
        } while (obj)
    }
    return [left,top]
}

export interface IProgressBarProps {
    color?: string
    value?: number
    text?: string
    orientation?: string
    onMouseDown?: (e: any) => void
}

export class ProgressBar<P extends IProgressBarProps = IProgressBarProps, S = {}> extends React.Component<P, S> {

    private barStyleBase: React.CSSProperties
    private textStyle: React.CSSProperties
    private bgStyleBase: React.CSSProperties

    constructor(props) {
        super(props);

        // this.min = 0
        // this.max = 100

        const color = props.color || "#00aa00"
        const bgcolor = mulColor(color, 0.4)

        this.barStyleBase = {
            "height": "100%",
            "width": "100%",
            "borderRadius": "5px",
            "background": color,
            "position": "absolute",
            // "bottom": "0px"
        }

        this.textStyle = {
            "color": "black",
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "transform": "translate(-50%, -50%)"
        }

        this.bgStyleBase = {
            "height": "100%",
            "width": "100%",
            "borderRadius": "5px",
            "background": bgcolor,
            "position": "relative"
        }

        const orientation = props.orientation
        const attachPoint = props.attachPoint || "top"

        if (orientation === "vertical" && attachPoint === "top"){
            this.barStyleBase.bottom = undefined
            this.barStyleBase.top = "0px"
            this.barStyleBase.left = "0px"
        } else {
            this.barStyleBase.bottom = "0px"
            this.barStyleBase.top = undefined
            this.barStyleBase.left = "0px"
        }
    }

    render() {
        const { value, color, orientation } = this.props
        const { text } = this.props

        const bgStyle = this.bgStyleBase
        const barStyle = orientation === "vertical" ? { ...this.barStyleBase, height: value+"%" } : { ...this.barStyleBase, width: value+"%" }
        const textStyle = this.textStyle

        return (
            <div draggable={true} style={bgStyle} onMouseDown={this.props.onMouseDown} >
                <div className="value" style={barStyle}></div>
                { typeof(text) !== "undefined" && <span style={textStyle}>{text}</span> }
            </div>
        )
    }
}

export interface IClickableProgressBarProps extends IProgressBarProps{
    onChange: (value: number) => void
}

export class ClickableProgressBar extends ProgressBar<IClickableProgressBarProps> {
    private dragArea: HTMLElement
    private dragElement: HTMLElement

    constructor(props) {
        super(props);

        this.handleMouseDown = this.handleMouseDown.bind(this)
        this.handleMouseMove = this.handleMouseMove.bind(this)
        this.handleMouseUp = this.handleMouseUp.bind(this)
    }

    private setValue(val) {
        let p = 100* val
        if (p>100) { p = 100 }
        if (p<0) { p = 0 }
        this.props.onChange(p)
    }

    private barClick(e) {
        e.preventDefault()
        const el = this.dragElement as any
        const ex = el._globaloffsetX || getXY(el)[0]
        el._globaloffsetX = ex
        const val = e.clientX - ex
        const width = el.offsetWidth
        const p = val/width
        
        this.setValue(p)
    }

    private handleMouseDown(e: React.MouseEvent<HTMLElement>) {
        this.dragElement = e.currentTarget as HTMLElement
        this.dragArea = this.dragElement.parentNode.parentNode.parentNode.parentNode as HTMLElement
        this.barClick(e)
        this.dragArea.addEventListener('mousemove', this.handleMouseMove);
        this.dragArea.addEventListener('mouseup', this.handleMouseUp);
    }

    private handleMouseMove(e: MouseEvent) { // DOM MouseEvent and react mouse event are different
        return this.barClick(event)
    }

    private handleMouseUp(event?: MouseEvent) {
        if (this.dragArea){
            this.dragArea.removeEventListener('mousemove', this.handleMouseMove);
            this.dragArea.removeEventListener('mouseup', this.handleMouseUp);
        }
        this.dragElement = null
    }

    componentWillUnmount() {
        return this.handleMouseUp()
    }

    render() {
        return <ProgressBar onMouseDown={this.handleMouseDown} {...this.props}/>
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

export class PeriodicProgressBar extends ProgressBar<IPeriodicProgressBarProps, IPeriodicProgressBarState> {
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

