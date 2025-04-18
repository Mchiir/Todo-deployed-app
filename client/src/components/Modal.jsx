import { useState } from "react"
import { useAuth } from '../context/AuthContext';

const Modal = ({ mode, setShowModal, getData, task }) => {
  const { authToken, email: userEmail } = useAuth();

  const editMode = mode === 'edit'
  const [data, setData] = useState({
    user_email: editMode ? task.user_email : userEmail,
    title: editMode ? task.title : '',
    progress: editMode ? task.progress : 50,
    date: editMode ? task.date : new Date().toISOString().split('T')[0], // Set date to a string
  })

  const postData = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization':`Bearer ${authToken}`
         },
        body: JSON.stringify(data),
      })

      if (response.status === 200) {
        console.log("Worked!")
        setShowModal(false)
        getData()
      } else {
        console.log("Problem storing task!")
      }
    } catch (err) {
      console.error(err.errorMessage)
    }
  }

  const editData = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${task.id}`, {
        method: "PUT",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization':`Bearer ${authToken}`
         },
        body: JSON.stringify(data),
      })

      if (response.status == 200) {
        setShowModal(false)
        getData()
      } else {
        const errorMessage = await response.json();
        console.error('Error:', errorMessage);
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setData((data) => ({
      ...data,
      [name]: value,
    }))
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="form-title-container">
          <h3>Let's {mode} your task</h3>
          <button onClick={() => setShowModal(false)}><span>❌</span></button>
        </div>

        <form onSubmit={editMode ? editData : postData}>
          <input
            required
            maxLength={100}
            placeholder="Your task goes here"
            name="title"
            value={data.title || ''} // Ensure value is always a string
            onChange={handleChange}
          />
          <br />
          <label htmlFor="range">Drag to select your current progress</label>
          <input
            type="range"
            min="0"
            max="100"
            name="progress"
            value={data.progress}
            onChange={handleChange}
          />
          <input className={mode} type="submit" value={editMode ? 'Update' : 'Add'} />
        </form>
      </div>
    </div>
  )
}

export default Modal