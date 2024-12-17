import { useState } from 'react'
import TickIcon from './TickIcon'
import ProgressBar from './ProgressBar'
import Modal from './Modal'

const ListItem = ({ task, getData }) => {
  const [showModal, setShowModal] = useState(false)

  const deleteData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/deleteTodo/${task.id}`, {
        method: 'DELETE'
      })
      // console.log(response)
      if (response.status === 200) {
        // console.log('Deletion successful');
        getData(); // Ensure this is called
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
        <Modal mode={'edit'} setShowModal={setShowModal} getData={getData} task={task} />
      )}
    </li>
  )
}

export default ListItem