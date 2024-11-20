// deps
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const db = require('./queries')

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
app.get('/events', db.getUsers)
app.get('/events/:id', db.getUserById)
app.post('/events', db.createUser)
app.put('/events/:id', db.updateUser)
app.delete('/events/:id', db.deleteUser)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
