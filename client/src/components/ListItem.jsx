import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TickIcon from './TickIcon';
import ProgressBar from './ProgressBar';
import Modal from './Modal';

const ListItem = ({ task, getData }) => {
  // Access auth token for protected delete request
  const { authToken } = useAuth();

  // Controls visibility of edit modal
  const [showModal, setShowModal] = useState(false);

  /**
   * Delete a specific todo item.
   * After successful deletion, refresh the list.
   */
  const deleteData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVERURL}/deleteTodo/${task._id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // JWT required for authorized deletion
            'Authorization': `Bearer ${authToken}`
          },
        }
      );

      if (response.status === 200) {
        // Re-fetch updated list after deletion
        getData();
      } else {
        console.error('Failed to delete');
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <li className="list-item">
      <div className="info-container">
        {/* Visual indicator for task completion */}
        <TickIcon />

        {/* Task title */}
        <p className="task-title">{task.title}</p>

        {/* Progress visualization */}
        <ProgressBar progress={task.progress} />
      </div>

      <div className="button-container">
        {/* Open edit modal */}
        <button className="edit" onClick={() => setShowModal(true)}>
          EDIT
        </button>

        {/* Trigger delete */}
        <button className="delete" onClick={deleteData}>
          DELETE
        </button>
      </div>

      {/* Conditionally render edit modal */}
      {showModal && (
        <Modal
          mode="edit"
          setShowModal={setShowModal}
          getData={getData}
          task={task}
        />
      )}
    </li>
  );
};

export default ListItem;