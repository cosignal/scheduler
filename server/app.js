// deps
const cors = require('cors')
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT
const db = require('./queries')

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL)
    res.header("Access-Control-Allow-Credentials", "true")
    next()
  })
//app.options('/events/:user_id', cors()) // ?
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

// routes
app.get('/', (req, res) => {
    res.json({ info: 'Root route' })
})
app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)
app.get('/events', db.getEvents)
/* app.get('/event/:id', db.getEventByID) */
app.get('/events/:user_id', db.getEventsByUserId) 
app.post('/events', db.createEvent)
app.put('/events/:id', db.updateEvent)
app.delete('/events/:id', db.deleteEvent)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
