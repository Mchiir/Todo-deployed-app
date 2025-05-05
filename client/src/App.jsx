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
    // console.log(`Token : ${authToken}\nEmail: ${userEmail}\n`);
    // console.log(`Server: ${process.env.REACT_APP_SERVERURL}`)

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}) );
        const errMessage = errData.message || `HTTP error! status : ${response.status}`;
        throw new Error(errMessage);
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching todos:', err.message);
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
      <p className="copyright">By <a href='https://github.com/Mchiir' target='_blank'>Mchiir</a></p>
    </div>
  );
};

export default App;