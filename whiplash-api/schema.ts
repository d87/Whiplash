import mongoose from 'mongoose'
import { Task, Todo } from './models'
import {makeExecutableSchema} from 'graphql-tools'
import gql from 'graphql-tag'
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './subscriptionServer'
import { logger } from './logger'

const ObjectId = mongoose.Types.ObjectId
ObjectId.prototype.valueOf = function () {
	return this.toString()
}

const typeDefs = [gql`
    scalar Date

    type Query {
        task(_id: ID): Task
        tasks: [Task]
        todo(_id: ID): Todo
        todos: [Todo]
    }

    type Task {
        _id: ID!
        userID: ID
        title: String!
        description: String
        priority: Int
        resetMode: String
        resetTime: Int

        dueTime: Int
        duration: Int
        segmentDuration: Int
        progress: Int
        state: String
        color: String

        isRecurring: Boolean

        completedAt: Date
        createdAt: Date
    }

    input TaskInput {
        _id: ID
        title: String!
        description: String
        priority: Int
        dueTime: Int
        duration: Int
        resetTime: Int
        resetMode: String
        segmentDuration: Int
        progress: Int
        state: String
        color: String
        isRecurring: Boolean
    }

    type Todo {
        _id: ID!
        title: String
        description: String
        priority: Int
        state: String
        color: String
        created_date: String
        is_time_limited: Boolean
        expiration_date: String
    }

    type Mutation {
        createTodo(title: String!, description: String): Todo
        createTask(input: TaskInput): Task
        saveTask(input: TaskInput): Task
        completeTask(id: String!): Task
        uncompleteTask(id: String!): Task
        addProgress(id: String!, time: Int!): Task
    }

    type Subscription {
        updateTasks: [Task]
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`];

const resolvers = {
    Query: {
        todo: async (root, {_id}) => {
            return await Todo.findOne({ _id })
        },
        todos: async (root, args, context) => {
            // if (!context.user) return [];
            const todos = await Todo.find().lean().exec()
            return todos
        },
        task: async (root, {_id}) => {
            return await Task.findOne({ _id })
        },
        tasks: async (root, args, context) => {
            const userID = context.user._id
            // const tasks = await 
            return Task.find({ userID })
        },
    },
    Date: {
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            // When GQL in serializing objects from pubsub payload
            // Date types are already converted to string in that process
            if (typeof value === "string") {
                value = new Date(value)
            }
            return value.getTime(); // value sent to the client
        },
    },
    // Post: {
    //     comments: async ({_id}) => {
    //         return (await Comments.find({postId: _id}).toArray()).map(prepare)
    //     }
    // },
    // Comment: {
    //     post: async ({postId}) => {
    //         return prepare(await Posts.findOne(ObjectId(postId)))
    //     }
    // },
    Mutation: {
        createTodo: async (root, args, context, info) => {
            const newTodo = new Todo(args)
            return await newTodo.save()
        },
        createTask: async (root, args, context, info) => {
            const newTask = new Task(args.input)
            newTask.userID = context.user._id
            return await newTask.save()
        },
        saveTask: async (root, args, context, info) => {
            const data = args.input
            try {
                const task = await Task.findById(data._id)
                task.title = data.title
                task.description = data.description
                task.priority = data.priority
                task.dueTime = data.dueTime
                task.duration = data.duration
                task.segmentDuration = data.segmentDuration
                task.resetMode = data.resetMode
                task.resetTime = data.resetTime
                // task.state = data.state
                task.isRecurring = data.isRecurring
                task.color = data.color
                return await task.save()
            } catch(err) {
                console.error(err)
            }
        },
        completeTask: async (root, args, context, info) => {
            const id = args.id
            try {
                const task = await Task.findById(id)
                task.state = "completed"
                task.completedAt = new Date()
                return await task.save()
            } catch(err) {
                console.error(err)
            }
        },
        uncompleteTask: async (root, args, context, info) => {
            const id = args.id
            try {
                const task = await Task.findById(id)
                task.state = "active"
                task.progress = 0
                task.completedAt = undefined
                return await task.save()
            } catch(err) {
                console.error(err)
            }
        },
        addProgress: async (root, args, context, info) => {
            const id = args.id
            try {
                const task = await Task.findById(id)
                task.progress += args.time
                if (task.progress >= task.duration) {
                    task.state = "completed"
                    task.completedAt = new Date()
                }
                return await task.save()
            } catch(err) {
                console.error(err)
            }
        },
    },
    Subscription: {
        updateTasks: {
            resolve: (payload, variables, context, info) => {
                // Manipulate and return the new value
                logger.debug("Resolving updateTasks subscription")
                logger.debug("payload =", payload)
                return payload.tasks
            },
            subscribe: // (_, args) => pubsub.asyncIterator("TASKS_UPDATE")
                withFilter(
                    () => pubsub.asyncIterator("TASKS_UPDATE"),
                    // payload from pubsub event, variables from client query
                    (payload, variables, context, info) => {
                        try {
                            if (typeof payload === "undefined") return false // why is it undefined?
                            return payload.targetUserID === context.userID;
                        } catch (err) {
                            logger.error(err)
                        }
                    }
                )
        }
    }
}
        

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

export default schema