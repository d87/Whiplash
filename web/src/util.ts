export function componentToHex (c : number): string {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex;
}
// const as-1 ="asd"
export function rgbToHex(r: number, g: number, b: number) :string {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

interface IRGBColor { // 1 - 255
    r: number
    g: number
    b: number
}
interface IHSVColor { // 0 - 1
    h: number
    s: number
    v: number
}

export function rgbToHex2({ r, g, b}: IRGBColor) {
    return rgbToHex(r,g,b)
}

const FLOATING_POINT_NUMBER_CHARACTER_REGEX = /^[Ee0-9\+\-\.]$/;
export const isFloatingPointNumericCharacter = (character: string) => {
    return FLOATING_POINT_NUMBER_CHARACTER_REGEX.test(character);
}

const INTEGER_POINT_NUMBER_CHARACTER_REGEX = /^[Ee0-9\+\-]$/;
export const isIntegerNumericCharacter = (character: string) => {
    return INTEGER_POINT_NUMBER_CHARACTER_REGEX.test(character);
}

export function mulColor(hex:string, mul:number) : string {
    // hex to rgb
    if (hex.charAt(0) === "#") hex = hex.slice(1)
    const bigint = parseInt(hex, 16);
    // console.log(bigint)
    let r = (bigint >> 16) & 255; // tslint:disable-line
    let g = (bigint >> 8) & 255; // tslint:disable-line
    let b = bigint & 255; // tslint:disable-line

    r = Math.trunc(r*mul)
    g = Math.trunc(g*mul)
    b = Math.trunc(b*mul)

    return rgbToHex(r,g,b)
}

export const genColor = (hex:string) => [`#${hex}`, mulColor(hex,0.4)]

const gray = [ 50, 50, 50 ]
const yellow = [ 200, 100, 40 ]
const red = [ 230, 50, 50 ]

export function GetGradientColor(v: number){
    if (v > 1){ v = 1 }
    let c1
    let c2
    if (v < 0.6) {
        v = v/0.6
        c1 = gray
        c2 = yellow
    } else {
        v = (v - 0.6)/0.4
        c1 = yellow
        c2 = red
    }

    const r = c1[0] + v*(c2[0]-c1[0])
    const g = c1[1] + v*(c2[1]-c1[1])
    const b = c1[2] + v*(c2[2]-c1[2])
    return rgbToHex(r,g,b)
}

export function HSVtoRGB(h: number, s: number, v: number): IRGBColor {
    let r
    let g
    let b
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    /* tslint:disable */
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    /* tslint:enable */
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export function HSVtoRGB2({h, s, v}: IHSVColor) {
    return HSVtoRGB(h,s,v);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export function getRandomBrightColor(): string {
    const h = getRandomArbitrary(0, 1)
    const s = getRandomArbitrary(0.3, 1)
    const v = getRandomArbitrary(0.8, 1)

    const color: IRGBColor = HSVtoRGB(h,s,v)
    return rgbToHex2(color)
}

export function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

export function getRandomHex(len: number): string {
    let n = 0
    for (let i=0; i < len; i++) {
        n*=16
        n+=getRandomInt(16)
    }
    return n.toString(16)
}

export function formatTimeRemains(s: number): string {
    if (s >= 3600) {
        return `${Math.ceil(s / 3600)}h`
    } else if (s >= 60) {
        return `${Math.ceil(s / 60)}m`
    } else // if (s >= 10) {
        return `${Math.floor(s)}s`
    // }
    // return s.toFixed(1)
}

export function getMinutesFromSeconds(t: number|null): number|null {
    if (t === null) return null
    return Math.floor((t % 3600) / 60)
}

export function getHoursFromSeconds(t: number|null): number|null {
    if (t === null) return null
    let h = Math.floor(t / 3600)
    if (h >= 24) h = h - 24
    return h
}

export const zerofill = (value: number|string, n: number) => {
    const str = typeof value === "number" ? value.toString() : value
    return str.padStart(n, '0').slice(-n)
}

export function formatTimeHM(t : number): string{
    let h = Math.floor(t / 3600)
    t = t - h*3600
    h = h % 24
    const m =  Math.floor(t / 60)
    return `${h}:${zerofill(m,2)}`
}

export function formatTimeMS(t : number) {
    if (t >= 3600) return formatTimeHM(t)

    const m =  Math.floor(t / 60)
    const s =  Math.floor(t % 60)
    return `${m}:${zerofill(s,2)}`
}

export class MiniDaemon {
    owner: HTMLElement|null
    rate: number
    length: number
    INDEX: number
    PAUSED: boolean
    SESSION: any
    // lastCallTime: number
    task: () => boolean|void
    
    constructor(owner: HTMLElement|null, task: ()=>boolean|void, interval: number, len?: number) {
        // if (!(this && this instanceof MiniDaemon)) { return; }
        if (arguments.length < 2) { throw new TypeError("MiniDaemon - not enough arguments"); }

        this.owner = null;
        this.rate = 100;
        this.length = Infinity;
        this.SESSION = -1;
        this.INDEX = 0;
        this.PAUSED = true;

        if (owner) { this.owner = owner; }
        this.task = task;
        if (isFinite(interval) && interval > 0) { this.rate = Math.floor(interval); }
        if (len && len > 0) { this.length = Math.floor(len); }
    }

    forceCall() {
        this.INDEX += 1
        // const now = Date.now()
        // const elapsed = now - this.lastCallTime
        // this.lastCallTime = now
        if (this.task() === false) { this.pause(); return false; }
        return true;
    }

    pause() {
        clearInterval(this.SESSION);
        this.PAUSED = true;
    }
     
    start() {
        this.PAUSED = false;
        // this.lastCallTime = Date.now()
        this.synchronize();
    }

    isActive() {
        return (!this.PAUSED)
    }
    
    resume() {
        if (!this.isActive()) this.start()
    }
     
    private synchronize() {
        if (this.PAUSED) { return; }
        clearInterval(this.SESSION);
        this.SESSION = setInterval(this.forceCall.bind(this), this.rate);
    }
}
