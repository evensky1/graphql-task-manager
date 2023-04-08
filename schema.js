const {buildSchema} = require('graphql')

const schema = buildSchema(`
    type User {
        id: ID,
        username: String,
        password: String
    }
    
    type Task {
        id: ID,
        key: String,
        summary: String,
        postDate: String,
        status: String,
        fileName: String,
        fid: String,
        dueTo: String
    }
    
    input UserInput {
        id: ID,
        username: String!,
        password: String!
    }
    
    input TaskInput {
        id: ID,
        key: String,
        summary: String,
        fileName: String,
        fid: String,
        dueTo: String
    }
    
    type Query {
        getAllTasks: [Task]
    }
    
    type Mutation {
        createTask(input: TaskInput): Task
        updateTask(input: TaskInput): Task
    }
`)

module.exports = schema