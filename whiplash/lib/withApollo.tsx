import React from "react"
import PropTypes from "prop-types"
import { ApolloProvider, getDataFromTree } from "react-apollo"
import Head from "next/head"
import { initApollo } from "../src/api/api"
import { isBrowser } from './isBrowser'

// Gets the display name of a JSX component for dev tools
function getComponentDisplayName(Component) {
    return Component.displayName || Component.name || "Unknown"
}

export default ComposedComponent => {
    return class WithData extends React.Component {
        static displayName = `WithData(${getComponentDisplayName(ComposedComponent)})`
        static propTypes = {
            serverState: PropTypes.object.isRequired
        }

        static async getInitialProps(ctx) {
            // Initial serverState with apollo (empty)
            let serverState = {
                apollo: {
                    data: {}
                }
            }

            const apollo = initApollo()

            // console.log("with apollo context", Object.keys(ctx))
            // console.log("with apollo page context", Object.keys(ctx.ctx))

            ctx.ctx.client = apollo
            // Evaluate the composed component's getInitialProps()
            let composedInitialProps = {}
            if (ComposedComponent.getInitialProps) {
                composedInitialProps = await ComposedComponent.getInitialProps(ctx)
            }

            // console.log("composedInitialProps", Object.keys(composedInitialProps))

            // // Run all GraphQL queries in the component tree
            // // and extract the resulting data
            // if (!isBrowser) {
            //     try {
            //         // Run all GraphQL queries
            //         await getDataFromTree(
            //             <ApolloProvider client={apollo}>
            //                 <ComposedComponent {...composedInitialProps} />
            //             </ApolloProvider>,
            //             {
            //                 router: {
            //                     asPath: ctx.ctx.asPath,
            //                     pathname: ctx.ctx.pathname,
            //                     query: ctx.ctx.query
            //                 }
            //             }
            //         )
            //     } catch (error) {
            //         // Prevent Apollo Client GraphQL errors from crashing SSR.
            //         // Handle them in components via the data.error prop:
            //         // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            //     }
            //     // getDataFromTree does not call componentWillUnmount
            //     // head side effect therefore need to be cleared manually
            //     Head.rewind()

            //     // Extract query data from the Apollo store
            //     serverState = {
            //         apollo: {
            //             data: apollo.cache.extract()
            //         }
            //     }
            // }

            return {
                serverState,
                ...composedInitialProps
            }
        }

        constructor(props) {
            super(props)
            this.apollo = initApollo(this.props.serverState.apollo.data)
        }

        render() {
            return (
                <ApolloProvider client={this.apollo}>
                    <ComposedComponent {...this.props} />
                </ApolloProvider>
            )
        }
    }
}
