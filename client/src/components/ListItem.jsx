import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import TickIcon from './TickIcon'
import ProgressBar from './ProgressBar'
import Modal from './Modal'

const ListItem = ({ task, getData }) => {
  const { authToken, email: userEmail } = useAuth();
  const [showModal, setShowModal] = useState(false)

  const deleteData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/deleteTodo/${task._id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization':`Bearer ${authToken}`
         },
      })
      // console.log(response)
      if (response.status === 200) {
        // console.log('Deletion successful');
        getData(); // updating the todos list
      } else {
        console.error('Failed to delete');
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <li className="list-item">
      <div className="info-container">
        <TickIcon />
        <p className="task-title">{task.title}</p>
        <ProgressBar progress={task.progress}/>
      </div>

      <div className="button-container">
        <button className='edit' onClick={() => setShowModal(true)}>EDIT</button>
        <button className='delete' onClick={deleteData}>DELETE</button>
      </div>

      {showModal && (
        <Modal authToken={authToken} mode={'edit'} setShowModal={setShowModal} getData={getData} task={task} />
      )}
    </li>
  )
}

export default ListItem