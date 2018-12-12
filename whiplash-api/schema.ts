import mongoose from 'mongoose'
import { Task, Todo } from './models'
import {makeExecutableSchema} from 'graphql-tools'
import gql from 'graphql-tag'

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

    schema {
        query: Query
        mutation: Mutation
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
                task.completedAt = Date.now()
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
                    task.completedAt = Date.now()
                }
                return await task.save()
            } catch(err) {
                console.error(err)
            }
        },
    },
}



        

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

export default schema