import { useState } from "react"
import Modal from "./Modal"
import { useAuth } from "../context/AuthContext"

const ListHeader = ({ listName, getData }) => {
  const { logout } = useAuth();
  
  const [showModal, setShowModal] = useState(false)
  const signOut = () => {
    console.log('signed out')
    // removeCookie('Email')
    // removeCookie('AuthToken')
    logout();

    window.location.reload()
  }
  
  return (
    <div className="list-header">
      <h1>{listName}</h1>
      <div className="button-container">
        <button className="create" onClick={() => setShowModal(true)}>ADD NEW</button>
        <button className="signout" onClick={signOut}>SIGN OUT</button>
      </div>
      {showModal && <Modal mode={'create'} setShowModal={setShowModal} getData={getData}/>}
    </div>
  )
}

export default ListHeader