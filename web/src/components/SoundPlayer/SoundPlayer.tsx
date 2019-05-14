import React, { Component, useState, useEffect } from "react"
import { Howl, Howler } from "howler"
import { ClickableProgressBar } from "../ProgressBar/ProgressBar"
import { useDispatch } from "react-redux"
import styled from "styled-components"

const sounds = {
    devotion: new Howl({ src: "/static/DevotionAura.ogg", volume: 0.39, autoSuspend: true }),
    equip: new Howl({ src: "/static/equip.mp3", autoSuspend: true }),
    mgs: new Howl({ src: "/static/MGS4Codec4.mp3", autoSuspend: true }),
    alert: new Howl({ src: "/static/solid_eye.mp3", volume: 0.7, autoSuspend: true }),
    resize: new Howl({ src: "/static/resize.mp3", volume: 0.7, autoSuspend: true }),
    menu: new Howl({ src: "/static/menu.mp3", autoSuspend: true }),
    abolish: new Howl({ src: "/static/AbolishMagic.mp3", volume: 0.39, autoSuspend: true }),
    absorbhit: new Howl({ src: "/static/AbsorbGetHitA.mp3", volume: 0.1, autoSuspend: true })
}

export const playSound = soundID => {
    sounds[soundID].play()
}

const StyledVolumeControl = styled.div`
    height: 2em;
    width: 8em;
    display: grid;
    grid-template-columns: 30px auto;
`

const VolumeIcon = styled.span`
    color: #888888;
`

const BarContainer = styled.div`
    padding-top: 0.8em;
    padding-bottom: 0.8em;
`

const isBrowser = typeof window !== "undefined"
const saveVolume = (v: number) => {
    return localStorage.setItem("volume", v.toString())
}
const loadVolume = (): number => {
    return parseFloat(localStorage.getItem("volume"))
}

const handleVolumeChange = (v100: number) => {
    const v = Math.round(v100) / 100
    saveVolume(v)
    return v
}

export const VolumeControl: React.FC<{}> = props => {
    const [volume, setVolume] = useState(1)

    useEffect(() => {
        if (isBrowser) {
            setVolume(loadVolume())
        }
    }, [])

    useEffect(() => {
        Howler.volume(volume)
    }, [volume])

    const dispatch = useDispatch()

    let volumeIconString: string
    if (volume === 0) volumeIconString = "volume_off"
    else if (volume < 0.1) volumeIconString = "volume_mute"
    else if (volume < 0.5) volumeIconString = "volume_down"
    else volumeIconString = "volume_up"

    return (
        <StyledVolumeControl>
            <VolumeIcon className={`material-icons flexCenter iconAlign_${volumeIconString}`}>
                {volumeIconString}
            </VolumeIcon>
            <BarContainer>
                <ClickableProgressBar
                    onChange={v100 => setVolume(handleVolumeChange(v100))}
                    color="#888888"
                    value={volume * 100}
                />
            </BarContainer>
        </StyledVolumeControl>
    )
}
