import { createContext, useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(['AuthToken', 'Email']);
  const [authToken, setAuthToken] = useState(cookies.AuthToken || null);
  const [email, setEmail] = useState(cookies.Email || null);

  // Keep state in sync with cookie changes
  useEffect(() => {
    setAuthToken(cookies.AuthToken || null);
    setEmail(cookies.Email || null);
  }, [cookies.AuthToken, cookies.Email]);

  // Login function - sets cookies and updates state
  const login = (email, token) => {
    setCookie('AuthToken', token, { path: '/' });
    setCookie('Email', email, { path: '/' });
    setAuthToken(token);
    setEmail(email);
  };

  // Logout function - removes cookies and clears state
  const logout = () => {
    removeCookie('AuthToken', { path: '/' });
    removeCookie('Email', { path: '/' });
    setAuthToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);