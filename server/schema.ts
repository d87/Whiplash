import mongoose, { Error } from 'mongoose'
import { Task, TaskEvent, Todo, BlogPost, User } from './models'
import {makeExecutableSchema} from 'graphql-tools'
import gql from 'graphql-tag'
import { withFilter } from 'graphql-subscriptions';
import { pubsub } from './pubsub'
import { logger } from './logger'
import { taskInputValidationSchema, taskAddProgressValidationSchema } from './mutationValidators'

const ObjectId = mongoose.Types.ObjectId
ObjectId.prototype.valueOf = function () {
	return this.toString()
}

const typeDefs = [gql`
    scalar Date

    type Query {
        user_profile: User
        task(_id: ID): Task
        tasks: [Task]
        taskEvents: [TaskEvent]
        todo(_id: ID): Todo
        todos: [Todo]
        blogPosts: [BlogPost]
    }

    type User {
        _id: ID
        username: String
        name: String
        email: String
    }

    type Task {
        _id: ID!
        userID: ID
        title: String!
        description: String
        priority: Int
        resetMode: String
        resetTime: Int

        dueDate: Date
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

    type TaskEvent {
        userID: ID
        timestamp: Date
        title: String
        color: String
    }

    input TaskInput {
        _id: ID
        title: String!
        description: String
        priority: Int
        dueDate: Date
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

    type BlogPost {
        _id: ID!
        userID: ID
        body: String
        rating: Int
        createdAt: Date
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
        eventLog: TaskEvent
    }

    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`];

const resolvers = {
    Query: {
        user_profile: async (root, args, context) => {
            if (context.user === undefined) return {}
            const userID = context.user._id
            return User.findOne({ _id: userID })
        },
        todo: async (root, {_id}) => {
            return Todo.findOne({ _id })
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
            if (context.user === undefined) return []
            // logger.debug(context.user)
            const userID = context.user._id
            // const tasks = await
            return Task.find({ userID })
        },
        taskEvents: async (root, args, context) => {
            if (context.user === undefined) return []
            const userID = context.user._id
            return TaskEvent.find({ userID })
        },

        blogPosts: async (root, args, context) => {
            if (context.user === undefined) return []
            const userID = context.user._id
            return BlogPost.find({ userID })
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
            const data = args.input
            try {
                const isValid = taskInputValidationSchema.validateSync(data)
                if (isValid) {
                    const newTask = new Task(data)
                    newTask.userID = context.user._id
                    return newTask.save()
                }
            } catch(err) {
                logger.error(err)
                throw err
            }
        },
        saveTask: async (root, args, context, info) => {
            const data = args.input
            try {
                const isValid = taskInputValidationSchema.validateSync(data)
                if (isValid) {
                    const task = await Task.findById(data._id)
                    task.title = data.title
                    task.description = data.description
                    task.priority = data.priority
                    task.dueDate = data.dueDate
                    task.dueTime = data.dueTime
                    task.duration = data.duration
                    task.segmentDuration = data.segmentDuration
                    task.resetMode = data.resetMode
                    task.resetTime = data.resetTime
                    // task.state = data.state
                    task.isRecurring = data.isRecurring
                    task.color = data.color
                    const savedTask = await task.save()
                    return savedTask
                }
            } catch(err) {
                logger.error(err)
                throw err
            }
        },
        completeTask: async (root, args, context, info) => {
            const id = args.id
            try {
                const task = await Task.findById(id)
                task.state = "completed"
                const now = new Date()
                task.completedAt = now
                task.createTaskCompleteEvent(now)

                return await task.save()
            } catch(err) {
                logger.error(err)
                throw err
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
                logger.error(err)
                throw err
            }
        },
        addProgress: async (root, args, context, info) => {
            try {
                taskAddProgressValidationSchema.validateSync(args)
                const id = args.id
                const task = await Task.findById(id)
                task.progress += args.time
                if (task.progress >= task.duration) {
                    task.state = "completed"
                    const now = new Date()
                    task.completedAt = now

                    task.createTaskCompleteEvent(now)
                }
                return await task.save()
            } catch(err) {
                logger.error(err)
                throw err
            }
        },
    },
    Subscription: {
        updateTasks: {
            resolve: (payload, variables, context, info) => {
                // Manipulate and return the new value
                logger.debug("Resolving updateTasks subscription")
                // logger.debug("payload =", payload)
                return payload.tasks
            },
            subscribe: // (_, args) => pubsub.asyncIterator("TASKS_UPDATE")
                withFilter(
                    () => pubsub.asyncIterator("TASKS_UPDATE"),
                    // payload from pubsub event, variables from client query
                    (payload, variables, context, info) => {
                        if (typeof payload === "undefined") return false // why is it undefined?
                        return payload.targetUserID === context.userID;
                    }
                )
        },
        eventLog: {
            resolve: (payload, variables, context, info) => {
                return payload.event
            },
            subscribe: // (_, args) => pubsub.asyncIterator("TASKS_UPDATE")
                withFilter(
                    () => pubsub.asyncIterator("TASK_COMPLETE"),
                    // payload from pubsub event, variables from client query
                    (payload, variables, context, info) => {
                        if (typeof payload === "undefined") return false // why is it undefined?
                        return payload.targetUserID === context.userID;
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