import "./whiplash.global.scss"
import React, { Component } from "react"
import ReactDOM from "react-dom"

// import { client } from "../../api/api"
import { ApolloProvider, withApollo } from "react-apollo"
import { Route, Link } from "react-router-dom"

import { Provider } from "react-redux"

import TaskList from "../Tasks/TaskList"
// import Schedule from "../Tasks/Schedule"
import SoundPlayer from "../SoundPlayer/SoundPlayer"
import TimerApp from "../TimerApp/TimerApp"
import LoginPage from "../LoginPage/LoginPage"
import NavBar from "../NavBar/NavBar"
import FilterBar from "../FilterSelect/FilterSelect"

import { Store } from "redux"
import { IAppState } from "../../store"


// import { CssBaseline, MuiThemeProvider, createMuiTheme, AppBar, Toolbar, Typography, Button } from "@material-ui/core"
// import { fade } from "@material-ui/core/styles/utils/colorManipulator"
// import { grey, cyan, pink } from "@material-ui/core/colors"

// const theme = createMuiTheme({
//     palette: {
//         type: "dark", // Switching the dark mode on is a single property value change.
//         background: {
//             default: "#030303"
//         }
//         // primary: {
//         // main: "#100310"
//         // }
//     },
//     typography: {
//         useNextVariants: true
//     }
// })

// <MuiThemeProvider theme={theme}>
// <CssBaseline />
// <AppBar position="static">
//     <Toolbar>
//         <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
//             Photos
//         </Typography>
//         <LoginButton />
//     </Toolbar>
// </AppBar>

export interface IAppProps {
    store: Store // <IAppState>;
}

export class App extends React.Component<IAppProps> {
    render() {
        return (
            // <Provider store={this.props.store}>
                // <ApolloProvider client={client}> 
                            <div>
                                <TaskList/>
                                {/* <Route path="/tasks" render={() => {
                                    return 
                                }} />

                                <Route path="/login" component={LoginPage} />

                                <Route path="/timers" component={TimerApp} /> */}
                            </div>
                // </ApolloProvider>
            // </Provider>
        )
    }
}

export default App
