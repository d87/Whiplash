import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"
import { getCurrentUserProfile } from "../../api/api"
import { authLoginSuccess } from "../../auth/authActions"

const Username = styled.span`
    size: 2em;
`

export const UserBadge: React.FC<{}> = (props) => {
    const dispatch = useDispatch()
    const { loggedIn, username } = useSelector(state => {
        return state.auth
    })

    useEffect(() => {
        getCurrentUserProfile()
            .then(response => {
                dispatch(authLoginSuccess(response.data.user_profile))
            })
            .catch(err => console.error(err))
    }, [])

    if (!loggedIn) return null
    return (
        <Username>{username}</Username>
    )
}