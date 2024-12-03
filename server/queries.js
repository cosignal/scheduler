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

const createUser = async (request, response) => {
  try {
    const { name, email } = request.body
    
    const results = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    )
    response.status(201).json({ id: results.rows[0].id })
  } catch (error) {
    console.error("DB Query error: ", error)
    response.status(500).json({ error: 'Internal server error' })
  }
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

const getEventsByUserId = async (request, response) => {
  try {
    const userId = parseInt(request.params.user_id)
    const results = await db.query('SELECT * FROM events WHERE user_id = $1', [userId])
    response.status(200).json(results.rows)
  } catch (error) {
    console.error('Error fetching user events:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}

const createEvent = async (request, response) => {
  try {
    const { user_id, title, description, start_time, end_time, date } = request.body
    const results = await db.query('INSERT INTO events (user_id, title, description, start_time, end_time, date) VALUES ($1, $2, $3, TO_TIMESTAMP($4,\'HH24:MI:SS\')::time without time zone, TO_TIMESTAMP($5,\'HH24:MI:SS\')::time without time zone, $6) RETURNING *',
      [user_id, title, description, start_time, end_time, date]
    )
    response.status(201).json({ message: `Event added with ID: ${results.rows[0].id}` })
    } catch (error) {
      console.error('Error creating event:', error);
      response.status(500).json({ error: 'Internal server error' });
    }
  }

const getClassesByUserId = async (request, response) => {
  try {
    const userId = parseInt(request.params.user_id)
    const results = await db.query('SELECT * FROM classes WHERE user_id = $1', [userId])
    response.status(200).json(results.rows)
  } catch (error) {
    console.error('Error fetching user classes:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}

const createClass = async (request, response) => {
  try {
    const { user_id, class_title, credits, class_start, class_end, days } = request.body
    const results = await db.query('INSERT INTO classes (user_id, class_title, credits, class_start, class_end, days) VALUES ($1, $2, $3, TO_TIMESTAMP($4,\'HH24:MI:SS\')::time without time zone, TO_TIMESTAMP($5,\'HH24:MI:SS\')::time without time zone, $6) RETURNING *',
      [user_id, class_title, credits, class_start, class_end, days]
    )
    response.status(201).json({ message: `Class added with ID: ${results.rows[0].id}` })
  } catch (error) {
    console.error('Error creating class:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
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
  getEventsByUserId,
  createEvent,
  getClassesByUserId,
  createClass,
  updateEvent,
  deleteEvent,
}
