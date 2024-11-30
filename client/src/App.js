import './App.css'
import React, { useState, useEffect } from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import { useForm } from 'react-hook-form'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const Calendar = () => {
  const location = useLocation()
  const user_id = location.state?.user_id
  const [events, setEvents] = useState([])
  const [submissions, setSubmissions] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const [start_time, setStartTime] = useState('')
  const [end_time, setEndTime] = useState('')
  const [date, setDate] = useState('')
  const { handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState(null)
  const apiURL = process.env.REACT_APP_API_URL

const fetchData = async () => {
  try {
    const response = await fetch(`${apiURL}/events/${user_id}`,
      {mode: 'cors'}
    )
    if (!response.ok) {
      throw new Error('Failed to fetch user events data')
    }
    const result = await response.json()
    setEvents(result)
  } catch (error) {
    setError(error.message)
  }
}

  const onSubmit = async (formData) => {
    try {
      const response = await fetch(`${apiURL}/events`, {
        method: 'POST',
        mode: 'cors',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }),
        credentials: 'include',
        body: JSON.stringify({ user_id, title, description, start_time, end_time, date })
      })
      const result = await response.json()
      console.log("POST user event: ", result)
      setSubmissions(prevCount => prevCount + 1)
      fetchData()
    } catch (error) {
      console.error('POST request Error:', error)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [submissions])
  
  return (
    <div className="calendar">
    <h1>Your Calendar</h1>
    <div>
    <p>Calendar View Goes Here</p>
    </div>
    <div className="addEvent">
    <Popup trigger=
    {<button> Click to add event </button>}
    position="right center">
    <div>Insert event info
    
    <form onSubmit={handleSubmit(onSubmit)}>
    <label>Event Name</label>
    <input 
    type="text" 
    id="title" 
    value={title} 
    onChange={(e) => setTitle(e.target.value)} 
    required 
    /><br/>
    
    <label>Description</label>
    <input 
    type="text" 
    id="desc" 
    value={description} 
    onChange={(e) => setDesc(e.target.value)} 
    required 
    /><br/>
    
    <label>Start Time</label>
    <input 
    type="time" 
    id="startTime" 
    value={start_time} 
    onChange={(e) => setStartTime(e.target.value)} 
    required 
    /><br/>
    
    <label>End Time</label>
    <input 
    type="time" 
    id="endTime" 
    value={end_time} 
    onChange={(e) => setEndTime(e.target.value)} 
    required 
    /><br/>
    
    <label>Date</label>
    <input 
    type="date" 
    id="date" 
    value={date} 
    onChange={(e) => setDate(e.target.value)} 
    required 
    /><br/>
    <button type='submit'>Add event</button>
    </form>
    
    </div>
    </Popup>
    </div>
    
    <div>
    <h2>Events</h2>
    <ul>
    {events.map(event => (
      <li key={event.id}>
      <h3>{event.title}</h3>
      <p>Date: {event.date.slice(0, 10)}</p>
      <p>Time: {event.start_time} - {event.end_time}</p>
      <p>{event.description}</p>
      </li>
    ))}
    </ul>
    </div>
    
    </div>
  )
}

const UserLogin = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [user_id, setID] = useState('')
  const apiURL = process.env.REACT_APP_API_URL
  const location = useLocation()
  const users = location.state?.users
  let newUser = true
  const [formKey, setFormKey] = useState(0)
  const { handleSubmit, reset, setError, formState: { errors } } = useForm()
  
  const onSubmit = async (formData) => {
    await sleep(1000)
    // check if entered user exists
    for (const user of users) {
      if ((user.name === name) && (user.email === email)) {
        // existing user
        newUser = false
        setID(user.id)
        navigate('/calendar', { state: { user_id } })
      } else if ((user.name === name) || (user.email === email)) {
        // wrong username OR email
        newUser = false
        setFormKey(prevKey => prevKey + 1)
        setError('root.serverError', {
          type: 'manual',
          message: 'Incorrect username or email'
        })
      }
    }
    if (newUser) {
      // new user
      try {
        const response = await fetch(`${apiURL}/users`, {
          method: 'POST',
          mode: 'cors',
          headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }),
          credentials: 'include',
          body: JSON.stringify({ name, email })
        })
        const result = await response.json()
        setID(result.id)
        navigate('/calendar', { state: { user_id } })      
      } catch (error) {
        console.error('Error', error)
      }
    }
  }
  
  useEffect(() => {
    if (user_id) {
      navigate('/calendar', { state: { user_id } })
    }
  }, [user_id])
  
  return (
    <div className="login">
      <h1>User Login</h1>
      <form key={formKey} onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="name">Name: </label>
        <input type="text" 
        id="name" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        required 
        /><br/>
        <label htmlFor="email">Email: </label>
        <input type="email" 
        id="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required 
        /><br/>
        {errors.root?.serverError && (
          <p className="error">{errors.root.serverError.message}</p>
        )}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const apiURL = process.env.REACT_APP_API_URL
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/users`)
        if (!response.ok) {
          throw new Error('Failed to fetch users data')
        }
        const result = await response.json()
        setUsers(result)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])
  
  if (isLoading) {
    return <div className='spinner'>Loading.....</div>
  }
  if (error) {
    return <div className='error'>Error: {error}</div>
  }
  
  return (
    <Router>
    <div className="App">
    <header className="App-header">
    <div>
    <Routes>
    <Route path="/login" element={<UserLogin/>} />
    <Route path="/calendar" element={<Calendar/>} />
    <Route path="/" element={<Navigate to="/login" state={{ users }} replace />} />
    </Routes>
    </div>
    </header>
    </div>
    </Router>
  )
}

export default App
