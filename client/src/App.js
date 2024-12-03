import './App.css'
import React, { useState, useEffect } from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { RRule } from 'rrule' 
import { useForm } from 'react-hook-form'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const localizer = momentLocalizer(moment)
const DaysOfWeek = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday'
}
const dayMap = {
  Monday: RRule.MO,
  Tuesday: RRule.TU,
  Wednesday: RRule.WE,
  Thursday: RRule.TH,
  Friday: RRule.FR,
  Saturday: RRule.SA,
  Sunday: RRule.SU
}

const UserCalendar = ({allEvents}) => {
  // NOTE: Date object format: (YYYY, M, D, HH, MM, SS) where Seconds is optional
  const generateRecurringEvents = (event) => {
    const rDate = moment().format()
    const rYear = Number(rDate.slice(0,4))
    var endYear = rYear
    const startMonth = rDate.slice(5,7) - 1 // Month is zero-indexed
    var endMonth = startMonth + 6
    if (endMonth > 11) {
      endMonth = endMonth - 12
      endYear = rYear + 1
    }
    const rDay = Number(rDate.slice(8,10))
    const byWeekDay = event.days.map(day => dayMap[day])
    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: byWeekDay,
      dtstart: new Date(rYear, startMonth, rDay, 12, 0),
      until: new Date(endYear, endMonth, 1, 12, 0) // start/end dates for recurrence
    }) 
    return rule.all().map(date => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()
      const startHour = Number(event.class_start.slice(0,2))
      const startMinute = Number(event.class_start.slice(3,5))
      const endHour = Number(event.class_end.slice(0,2))
      const endMinute = Number(event.class_end.slice(3,5))
      const startTime = new Date(year, month, day, startHour, startMinute)
      const endTime = new Date(year, month, day, endHour, endMinute)
      return {
      ...event,
      id: event.id,
      title: event.class_title,
      start: startTime,
      end: endTime
      }
    })
  }

  let calendarEvents = allEvents.flatMap(event => {
    if (event.eventType === 'event') {
      const date = event.date.slice(0,10)
      const year = Number(date.slice(0,4))
      const month = date.slice(5,7) - 1 // Month is zero-indexed
      const day = Number(date.slice(8))
      const start = event.start_time
      const end = event.end_time
      const startHour = Number(start.slice(0,2))
      const startMinute = Number(start.slice(3,5))
      const endHour = Number(end.slice(0,2))
      const endMinute = Number(end.slice(3,5))
      
      return {
        id: event.id,
        title: event.title,
        desc: event.description,
        start: new Date(year, month, day, startHour, startMinute),
        end: new Date(year, month, day, endHour, endMinute)
      }

    } else if (event.eventType === 'class') {
      return generateRecurringEvents(event)
    }
  })

  return (
    <div>
      <div className="calendar">
        <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        />
      </div>
{/*       <div className="events">
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
      </div> */}
    </div>
  )
}

const Schedule = () => {
  const location = useLocation()
  const user_id = location.state?.user_id
  const name = location.state?.name
  const [events, setEvents] = useState([])
  const [submissions, setSubmissions] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDesc] = useState('')
  const [start_time, setStartTime] = useState('')
  const [end_time, setEndTime] = useState('')
  const [date, setDate] = useState('')
  const [classes, setClasses] = useState([])
  const [class_title, setClassTitle] = useState('')
  const [credits, setCredits] = useState(0)
  const [class_start, setClassStart] = useState('')
  const [class_end, setClassEnd] = useState('')
  const [days, setDays] = useState(null)
  const allEvents = [...events.map(event => ({ ...event, eventType: 'event' })),
                     ...classes.map(classEvent => ({ ...classEvent, eventType: 'class' }))
  ]
  //const allEvents = new Map([['events', events],['classes', classes]])
  const { register, handleSubmit, formState: { errors } } = useForm()
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
    try {
      const response = await fetch(`${apiURL}/classes/${user_id}`,
        {mode: 'cors'}
      )
      if (!response.ok) {
        throw new Error('Failed to fetch user classes data')
      }
      const result = await response.json()
      setClasses(result)
    } catch (error) {
      setError(error.message)
    }
  }
  
  const submitEvent = async (event) => {
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

  const submitClass = async (event) => {
    setDays(event.days)
    try {
      const days = event.days
      const response = await fetch(`${apiURL}/classes`, {
        method: 'POST',
        mode: 'cors',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }),
        credentials: 'include',
        body: JSON.stringify({ user_id, class_title, credits, class_start, class_end, days })
      })
      const result = await response.json()
      console.log("POST class: ", result)
      setSubmissions(prevCount => prevCount + 1)
      fetchData()
    } catch (error) {
      console.error('POST request Error:', error)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [submissions])
  
  let header
  if (name[name.length - 1] == 's') {
    header = `${name}' Schedule`
  } else {
    header = `${name}'s Schedule`
  }
  
  return (
    <div className="schedule">
      <h1>{header}</h1>
      <div>
        <div className="addEvent" style={{display: 'inline-block', margin: 15}}>
          <Popup trigger={<button> New Event </button>}
                 position="right center">
          <div>Insert Event Info
            <form onSubmit={handleSubmit(submitEvent)}>
              <label>Event Name</label>
              <input type="text" 
                     id="title" 
                     value={title} 
                     onChange={(e) => setTitle(e.target.value)} 
                     required
              /><br/>
              <label>Description</label>
              <input type="text" 
                     id="description"
                     value={description}
                     onChange={(e) => setDesc(e.target.value)}
                     required
              /><br/>
              <label>Start Time</label>
              <input type="time"
                     id="startTime"
                     value={start_time}
                     onChange={(e) => setStartTime(e.target.value)}
                     required
              /><br/>
              <label>End Time</label>
              <input type="time"
                     id="endTime"
                     value={end_time}
                     onChange={(e) => setEndTime(e.target.value)}
                     required
              /><br/>
              <label>Date</label>
              <input type="date"
                     id="date"
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     required
              /><br/>
              <button type='submit'>Add Event</button>
            </form>
          </div>
          </Popup>
        </div>
        <div className="addClass" style={{display: 'inline-block'}}>
          <Popup trigger={<button> New Class </button>}
                 position="right center">
            <div>Insert Class Info
              <form onSubmit={handleSubmit(submitClass)}>
                <label>Class Name</label>
                <input type="text" 
                       id="classTitle" 
                       value={class_title} 
                       onChange={(e) => setClassTitle(e.target.value)} 
                       required
                /><br/>
                <label>Credits</label>
                <input type="number" 
                       id="credits"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value)}
                      required
                /><br/>
                {Object.values(DaysOfWeek).map((day) => (
                  <label key={day}>
                    <input type="checkbox"
                           {...register('days')} 
                           value={day} />
                    {day}
                  </label>
                ))}
                <br/>
                <label>Start Time</label>
                <input type="time"
                      id="classStart"
                      value={class_start}
                      onChange={(e) => setClassStart(e.target.value)}
                      required
                /><br/>
                <label>End Time</label>
                <input type="time"
                       id="classEnd"
                       value={class_end}
                       onChange={(e) => setClassEnd(e.target.value)}
                       required
                /><br/>
                <button type='submit'>Add Class</button>
              </form>
            </div>
            </Popup>
        </div>
      </div>
      <div>
        <h2>Calendar</h2>
        <UserCalendar allEvents={allEvents} />
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
        navigate('/schedule', { state: { user_id } })
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
        navigate('/schedule', { state: { user_id } })      
      } catch (error) {
        console.error('Error', error)
      }
    }
  }
  
  useEffect(() => {
    if (user_id) {
      navigate('/schedule', { state: { user_id, name } })
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
    <Route path="/schedule" element={<Schedule/>} />
    <Route path="/" element={<Navigate to="/login" state={{ users }} replace />} />
    </Routes>
    </div>
    </header>
    </div>
    </Router>
  )
}

export default App
