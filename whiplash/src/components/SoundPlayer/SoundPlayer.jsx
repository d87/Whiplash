import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Howl, Howler} from 'howler';


const initialState = {
    url: "/static/train.mp3",
    volume: 100,
    status: "STOPPED"
};

const sounds = [
    new Howl({ src: '/static/DevotionAura.ogg', volume: 0.13, autoSuspend: true }),
    new Howl({ src: '/static/MGS4Codec4.mp3', autoSuspend: true }),
    new Howl({ src: '/static/AbolishMagic.mp3', volume: 0.13, autoSuspend: true }),
    new Howl({ src: '/static/AbsorbGetHitA.mp3', volume: 0.04, autoSuspend: true }),
]


const playSound = (soundID) => {
    return {
        type: "SOUND_PLAY",
        soundID
    }
}


const soundReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SOUND_PLAY': {
            sounds[action.soundID-1].play()
            return Object.assign({}, state, { status: "PLAYING" });
        }

        case 'SOUND_STOP': {
            return Object.assign({}, state, { status: "STOPPED" });
        }

        default:
            return state
    }
}




class SoundPlayer extends React.Component {
    constructor(props) {
        super(props)
        this.audioElement = React.createRef()
    }

    play() {
        this.audioElement.play()
    }

    setVolume(volume) {
        this.audioElement.volume(volume)
    }

    render() {
        const { url, status } = this.props.sound
        // const isPlaying = (status === "PLAYING")

        return <audio ref={(audio) => { this.audioElement = audio }} src={url} />   
    }
}


const mapStateToProps = (state, props) => {
    return {
        sound: state.sound
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SoundPlayer)
export { soundReducer, playSound }
