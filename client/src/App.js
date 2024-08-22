import { useEffect, useState } from 'react'
import Auth from "./components/Auth"
import ListHeader from "./components/ListHeader"
import ListItem from './components/ListItem'
import { useCookies } from 'react-cookie'

const App = () => {
  const [ cookies, setCookie, removeCookie ] = useCookies(null)
  const authToken = cookies.AuthToken
  const userEmail = cookies.Email
  const [tasks, setTasks] = useState([])

  const validateToken = () => {
    
  }
  
  const getData = async () => {

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`, {
        method: 'GET'
      })
      const json = await response.json()
      setTasks(json)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (authToken) {
      getData()
    }
  }
    , []) // Add an empty dependency array to run it once on mount

  // Sort by date
  const sortedTasks = tasks.sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <>
      <div className="app">
        {!authToken && <Auth />}
        {authToken &&
          <>
            <ListHeader listName={'🌴 Holiday tick list'} getData={getData} />
            <p className='user-email'>Welcome back {userEmail}</p>
            {sortedTasks.map((task) => (
              <ListItem key={task.id} task={task} getData={getData} />
            ))}
          </>}
          <p className='copyright'>Creative Coding LLC</p>
      </div>
    </>
  )
}

export default App