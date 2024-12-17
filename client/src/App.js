import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import Auth from './components/Auth';
import ListHeader from './components/ListHeader';
import ListItem from './components/ListItem';

const App = () => {
  const [cookies] = useCookies(['AuthToken', 'Email']); // Destructuring only what's needed
  const authToken = cookies.AuthToken;
  const userEmail = cookies.Email;
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (authToken) {
      const validateToken = async () => {
        try {
          await fetch(`${process.env.REACT_APP_SERVERURL}/validate-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: authToken }),
          });
        } catch (error) {
          console.error('Error with token validation:', error);
        }
      };

      validateToken();
    }
  }, [authToken]); // No missing dependencies here

  const getData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos/${userEmail}`, {
        method: 'GET',
      });
      const json = await response.json();
      setTasks(json);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (authToken) {
      getData();
    }
  }, [authToken, userEmail]); // Added userEmail as it’s used inside getData

  const sortedTasks = tasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="app">
      {!authToken && <Auth />}
      {authToken && (
        <>
          <ListHeader listName={'🌴 Holiday tick list'} getData={getData} />
          <p className="user-email">Welcome back {userEmail}</p>
          {sortedTasks.map((task) => (
            <ListItem key={task.id} task={task} getData={getData} />
          ))}
        </>
      )}
      <p className="copyright">By M. chrispin</p>
    </div>
  );
};

export default App;