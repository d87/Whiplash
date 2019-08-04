import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"

const Username = styled.span`
    size: 2em;
`

export const UserBadge: React.FC<{}> = (props) => {
    // return null
    const { loggedIn, username } = useSelector(state => { 
        return state.auth 
    }) 
    if (!loggedIn) return null
    return (
        <Username>{username}</Username>
    )
}