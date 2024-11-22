const db = require('./db');

const getUsers = (request, response) => {
    db.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  db.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
    const { name, email } = request.body
  
    db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`)
    })
  }

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  db.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
  
    db.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User deleted with ID: ${id}`)
    })
  }

const getEvents = (request, response) => {
    db.query('SELECT * FROM events ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getEventByUserId = (request, response) => {
  const id = parseInt(request.params.user_id)

  db.query('SELECT * FROM events WHERE user_id = $1', [user_id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createEvent = (request, response) => {
    const { user_id, title, description, start_time, end_time, all_day } = request.body
  
    db.query('INSERT INTO Events (name, email) VALUES ($1, $2) RETURNING *', [user_id, title, description, start_time, end_time, all_day], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`Event added with ID: ${results.rows[0].id}`)
    })
  }

const updateEvent = (request, response) => {
  const id = parseInt(request.params.id)
  const { user_id, title, description, start_time, end_time, all_day } = request.body

  db.query(
    'UPDATE events SET user_id = $1, title = $2, description = $3, start_time = $4, end_time = $5, all_day = $6 WHERE id = $7',
    [user_id, title, description, start_time, end_time, all_day, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Event modified with ID: ${id}`)
    }
  )
}

const deleteEvent = (request, response) => {
    const id = parseInt(request.params.id)
  
    db.query('DELETE FROM events WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Event deleted with ID: ${id}`)
    })
  }

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getEvents,
  getEventByUserId,
  createEvent,
  updateEvent,
  deleteEvent,
}
