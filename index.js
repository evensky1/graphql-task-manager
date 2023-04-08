const express = require('express')
const {graphqlHTTP} = require('express-graphql')
const cors = require('cors')
const bodyParser = require('body-parser')
const schema = require('./schema')
const Task = require('./models/Task')
const mongoose = require('mongoose');
const path = require('path');
const authMiddleware = require('./auth/authMiddleware.js')
const authRouter = require('./auth/authRouter')
const multer = require('multer')
let fileCount

const app = express()
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())
app.use('/auth', authRouter)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },

    filename: function (req, file, cb) {
        cb(null, fileCount + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});

const root = {
    getAllTasks: async () => {
        fileCount = await Task.find({}).count()
        return Task.find({})
    },
    createTask: async ({input}) => {
        fileCount++
        const newTask = new Task({
            key: input.key,
            summary: input.summary,
            postDate: new Date(),
            status: 'wip',
            fileName: input.fileName,
            fid: fileCount + path.extname(input.fileName),
            dueTo: input.dueTo
        })
        return newTask.save()
    },
    updateTask: async ({input}) => {
        const res = await Task.updateOne({_id: input.id}, {status: 'done'})

        if (res.modifiedCount === 1) return Task.findOne({_id: input.id});
    }
}

app.use('/graphql', authMiddleware, graphqlHTTP({
    graphiql: true,
    schema: schema,
    rootValue: root
}))

app.get('/download', (req, res) => res.status(200)
    .download(path.resolve(__dirname, 'uploads', req.query.fid)))

app.get('/login', authMiddleware, (req, res) =>
    res.sendFile(path.resolve(__dirname, 'static', 'login.html')))

app.get('/registration', authMiddleware, (req, res) =>
    res.sendFile(path.resolve(__dirname, 'static', 'registration.html')))

app.post('/uploadFile', upload.single('file'), (req, res) => {
    console.log(req.body)
    res.status(201)
})

mongoose.connect(process.env.CONNECTION_URL).then(_ => console.log('Connection to mongoDB was successful'))

app.listen(8085, () => console.log('Server runs on port 8085'))