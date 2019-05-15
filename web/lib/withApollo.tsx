import React from "react"
import PropTypes from "prop-types"
import { ApolloProvider, getDataFromTree } from "react-apollo"
import Head from "next/head"
import { initApollo } from "../src/api/api"
import { isBrowser } from "./isBrowser"

// Gets the display name of a JSX component for dev tools
function getComponentDisplayName(Component) {
    return Component.displayName || Component.name || "Unknown"
}

export default ComposedComponent => {
    return class WithData extends React.Component {
        static displayName = `WithData(${getComponentDisplayName(ComposedComponent)})`
        static async getInitialProps(ctx) {
            const {
                Component,
                router,
                ctx: { req, res }
            } = ctx

            // This Apollo getInitialProps is the outermost wrapper
            // This is a cutdown version, not using getDataFromTree, nor apollo cache extraction
            // because i'm not using Apollo Query components, or apollo link state
            // it only provides custom apollo client for Page's getInitialProps
            // (Passing user request cookie for SSR apollo client connections)
            // Data is fetched in page props and then dispatched to store
            
            // Later a second initApollo call is made in constructor,
            // but it's reusing the existing client


            let customCookie = req ? req.headers.cookie : null
            if (req === undefined) console.log("req is null", req)
            const apollo = initApollo(null, customCookie)
            

            ctx.ctx.client = apollo
            // Evaluate the composed component's getInitialProps()
            let composedInitialProps = {}
            if (ComposedComponent.getInitialProps) {
                composedInitialProps = await ComposedComponent.getInitialProps(ctx)
            }

            return composedInitialProps
        }

        constructor(props) {
            super(props)
            // this.apollo = initApollo(this.props.serverState.apollo.data)
            this.apollo = initApollo({})
        }

        render() {
            return (
                <ComposedComponent apolloClient={this.apollo} {...this.props}/>
            )
        }
    }
}
