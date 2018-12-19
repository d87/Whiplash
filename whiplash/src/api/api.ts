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
      reconnect: true
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
    cache: new InMemoryCache()
})

export const getTasks = (): Promise<ApolloQueryResult<{ tasks: Array<Partial<ITask>> }>> => {
    return client.query({
        query: GetTasks
    })
}

export const subscribeToResets = (userID: string) => {
    return client.subscribe({
        query: UpdateTasks,
        variables: { channelID: userID }
    })
}

// https://github.com/apollographql/subscriptions-transport-ws
const subscriptionObserver = subscribeToResets("5bed9cc91f633d12673a08ae")
subscriptionObserver.subscribe({
    next(data) {
        console.log("obsever got data ", data)
        // ... call updateQuery to integrate the new comment
        // into the existing list of comments
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
// su --mount-master -c busybox mount -o username=d87,password=123,rw,noperm,iocharset=utf8 -t cifs //192.168.1.1/root /data/media/0/mounts/nevi
// su --mount-master -c busybox mount -o username=d87,password=123,rw,noperm,iocharset=utf8 -t cifs //192.168.1.1/root /storage/sdcard0/mounts/nevi
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
