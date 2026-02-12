import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import ListHeader from './components/ListHeader';
import ListItem from './components/ListItem';

const App = () => {
  // Get authentication state from context
  const { authToken, email: userEmail } = useAuth();

  // Local state for storing fetched tasks
  const [tasks, setTasks] = useState([]);

  /**
   * Fetch todos from backend.
   * Wrapped in useCallback to:
   * 1. Prevent unnecessary re-creation on every render
   * 2. Satisfy react-hooks/exhaustive-deps rule
   */
  const getTodos = useCallback(async () => {
    // Do not fetch if user is not authenticated
    if (!authToken || !userEmail) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/todos`, {
        method: 'GET',
        headers: {
          // Send JWT for protected route authorization
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle non-2xx responses explicitly
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMessage =
          errData.message || `HTTP error! status : ${response.status}`;
        throw new Error(errMessage);
      }

      // Update UI state with fetched tasks
      const data = await response.json();
      setTasks(data);

    } catch (err) {
      console.error('Error fetching todos:', err.message);
    }
  }, [authToken, userEmail]);

  /**
   * Fetch todos whenever:
   * - authToken changes
   * - userEmail changes
   *
   * Since getTodos is memoized, we safely include it as dependency.
   */
  useEffect(() => {
    getTodos();
  }, [getTodos]);

  // Sort tasks by date (earliest first) without mutating original state
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="app">
      {/* Show Auth component if user not logged in */}
      {!authToken && <Auth />}

      {/* Show task list only if authenticated */}
      {authToken && (
        <>
          {/* Pass getTodos so children can trigger refresh */}
          <ListHeader listName={'🌴 Holiday tick list'} getData={getTodos} />

          <p className="user-email">Welcome back {userEmail}</p>

          {/* Render sorted tasks */}
          {sortedTasks.map((task) => (
            <ListItem key={task._id} task={task} getData={getTodos} />
          ))}
        </>
      )}

      {/* External link uses rel for security best practice */}
      <p className="copyright">
        By{' '}
        <a
          href="https://github.com/Mchiir"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mchiir
        </a>
      </p>
    </div>
  );
};

export default App;