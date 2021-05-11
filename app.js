const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const userRouter = require('./routes/user')
const chatRouter = require('./routes/chat')

const MONGODB_URI = 'mongodb+srv://nodejs-user:nodejsuser123.@cluster0.m8nox.mongodb.net/chatapp?retryWrites=true&w=majority'

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(userRouter)
app.use(chatRouter)
const test = 1
mongoose
    .connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(3000, ()=> {
            console.log('Listening port 3000')
        })
        const io = require('./socket').init(server, { cors: {origin: "*"}})
        io.on('connection', socket => {
            console.log(`Client connected ${socket.id}`)
        })
    })
