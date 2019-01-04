import App, { Container } from "next/app"
import React from "react"
import { ApolloProvider } from "react-apollo"
import { Provider } from "react-redux"

import withApollo from "../lib/withApollo"
import withRedux from "next-redux-wrapper"
import { initStore } from "../src/store"

class MyApp extends App {
    // static async getInitialProps({ Component, router, ctx }) {
    //     let pageProps = {}

    //     if (Component.getInitialProps) {
    //         pageProps = await Component.getInitialProps(ctx)
    //     }

    //     return { pageProps }
    // }

    render() {
        const { Component, pageProps, store, apolloClient } = this.props as any
        // console.log(this.props)
        return (
            <Container>
                <Provider store={store}>
                    <Component {...pageProps} />
                </Provider>
            </Container>
        )
    }
}

export default withApollo(withRedux(initStore)(MyApp))
