// deps
const cors = require('cors')
require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT
const db = require('./queries')

app.use(cors({
    origin: process.env.FRONTEND_URL
}))
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
app.get('/events/:id', db.getEventByUserId)
app.post('/events', db.createEvent)
app.put('/events/:id', db.updateEvent)
app.delete('/events/:id', db.deleteEvent)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
