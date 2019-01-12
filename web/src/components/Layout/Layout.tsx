import React from "react"
import Head from "next/head"
import NavBar from "../NavBar/NavBar"

export const Layout = props => {
    return (
        <div>
            <Head>
                <title>My page title</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link href='http://fonts.googleapis.com/css?family=PT+Sans+Narrow' rel='stylesheet' type='text/css'/>
                <link href='http://fonts.googleapis.com/css?family=Roboto+Condensed&subset=latin,cyrillic' rel='stylesheet' type='text/css'/>
                <link href='http://fonts.googleapis.com/css?family=Ubuntu+Condensed&subset=cyrillic-ext,latin' rel='stylesheet' type='text/css'/>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
            </Head>
            <NavBar />
            <div className="container App ">
                {props.children}
            </div>
        </div>
    )
}
