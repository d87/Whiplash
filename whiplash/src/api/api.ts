import gql from "graphql-tag"
import { ApolloClient, ApolloQueryResult } from "apollo-client"
import { HttpLink } from "apollo-link-http"
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink, concat, split } from "apollo-link"
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from "apollo-cache-inmemory"
import { SubscriptionClient } from "subscriptions-transport-ws";
import { getBearerToken } from "../auth/auth"
import { ITask } from "../components/Tasks/TaskActions"
import { store } from "../store"

import { GetTasks, UpdateTasks, NewTask, SaveTask, CompleteTask, UncompleteTask, AddProgress } from './task.gql'

import config from "../config"

import fetch from "cross-fetch"

const authMiddlewareJWT = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext({
        headers: {
            authorization: getBearerToken() || null
        }
    })

    return forward(operation)
})

const authMiddlewareCookies = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext({
        credentials: "include"
    })

    return forward(operation)
})

const wsLink = new WebSocketLink({
    // document.location.host
    uri: `ws://nevihta.d87:3001/api/subscriptions`,
    options: {
        reconnect: true,
        // reconnectionAttempts: 5
    }
});

const httpLink = new HttpLink({
    uri: `${config.apiUrl}/api/graphql`,
    fetch
})
const authHttpLink = concat(authMiddlewareCookies, httpLink)


// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
);


export const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
    connectToDevTools: true
})

export const getTasks = (): Promise<ApolloQueryResult<{ tasks: Array<Partial<ITask>> }>> => {
    return client.query({
        query: GetTasks
    })
}

export const subscribeToResets = (userID?: string) => {
    return client.subscribe({
        query: UpdateTasks,
        // variables: { channelID: userID }
    })
}

// https://github.com/apollographql/subscriptions-transport-ws
const subscriptionObserver = subscribeToResets()
subscriptionObserver.subscribe({
    next(data) {
        console.log("obsever got data ", data)
        
    },
    error(err) { console.error('err', err); },
});

interface ITaskServerData {
    _id?: string
    title: string
    description: string
    dueTime: number
    duration: number
    segmentDuration: number
    resetMode: string
    resetTime: number
    color: string
    priority: number
    isRecurring: boolean
}

export const createTask = (data: ITaskServerData): Promise<ApolloQueryResult<{ createTask: Partial<ITask> }>> => {
    const { title, description, dueTime, color, duration, segmentDuration, priority, isRecurring } = data
    const taskInput = { title, description, dueTime, color, duration, segmentDuration, priority, isRecurring }
    return client.mutate({
        mutation: NewTask,
        variables: { input: taskInput }
    })
}

export const saveTask = (data: ITaskServerData): Promise<ApolloQueryResult<{ saveTask: Partial<ITask> }>> => {
    const { _id, title, description, dueTime, resetMode, resetTime, color, duration, segmentDuration, priority, isRecurring } = data
    const taskInput = { _id, title, description, dueTime, resetMode, resetTime, color, duration, segmentDuration, priority, isRecurring }
    return client.mutate({
        mutation: SaveTask,
        variables: { input: taskInput }
    })
}

export const completeTask = (_id: string): Promise<ApolloQueryResult<{ completeTask: Partial<ITask> }>> => {
    return client.mutate({
        mutation: CompleteTask,
        variables: { id: _id }
    })
}

export const uncompleteTask = (_id: string): Promise<ApolloQueryResult<{ uncompleteTask: Partial<ITask> }>> => {
    return client.mutate({
        mutation: UncompleteTask,
        variables: { id: _id }
    })
}


export const addTaskProgress = (_id: string, progress: number): Promise<ApolloQueryResult<{ addProgress: Partial<ITask> }>> => {
    return client.mutate({
        mutation: AddProgress,
        variables: { id: _id, time: progress }
    })
}
