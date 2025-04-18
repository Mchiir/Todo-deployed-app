import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import ListHeader from './components/ListHeader';
import ListItem from './components/ListItem';

const App = () => {
  const { authToken, email: userEmail } = useAuth();
  const [tasks, setTasks] = useState([]);

  const getTodos = async () => {
    if (!authToken || !userEmail) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  };

  useEffect(() => {
    getTodos();
  }, [authToken, userEmail]); // Added userEmail as it’s used inside getData

  const sortedTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app">
      {!authToken && <Auth />}
      {authToken && (
        <>
          <ListHeader listName={'🌴 Holiday tick list'} getData={getTodos} />
          <p className="user-email">Welcome back {userEmail}</p>
          {sortedTasks.map((task) => (
            <ListItem key={task.id} task={task} getData={getTodos} />
          ))}
        </>
      )}
      <p className="copyright">By M. chrispin</p>
    </div>
  );
};

export default App;