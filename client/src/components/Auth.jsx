import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"

const Auth = ({ defaultMode = 'login' }) => {
  const [isLogIn, setIsLogin] = useState(defaultMode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // console.log("Cookies", cookies)

  // clearing on switching signup/login
  const viewLogin = (status) => {
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsLogin(status);
  };

    // Clearing errors on inputs change
    useEffect(() => {
      setError(null);
    }, [email, password, confirmPassword, isLogIn]);


  const validateEmail = (email) => {
    const regex = /^[a-z0-9]{1,20}@[a-z0-9.-]+\.[a-z]{2,}$/;
    return regex.test(email)
  }
  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    // Client-side validation
    let isValid = true;
    
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      isValid = false;
    } else if (!password) {
      setError('Please enter your password.');
      isValid = false;
    } else if (!isLogIn && !validatePassword(password)) {
      setError('Password must be 8+ chars with at least one uppercase letter');
      isValid = false;
    } else if (!isLogIn && password !== confirmPassword) {
      setError('Passwords do not match!');
      isValid = false;
    }

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    const endpoint = isLogIn ? 'login' : 'signup'
    try{
      const response = await fetch(`${process.env.REACT_APP_SERVERURL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json()

      if(isLogIn){
        if (!data.token || !data.email) {
          throw new Error('No authentication token received');
        }

        login(data.email, data.token);
      }else{
        // Handle signup success - switch to login view
        setMessage('Registration successful! Please login.');
        viewLogin(true);
      }
    } catch (err){
      console.error("Server error:", err.message);
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-container-box">
        <form onSubmit={handleSubmit}>
          <h2>{isLogIn ? 'Please log in' : 'Please sign up!'}</h2>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="message-space">{message}</p>}

          <input
            required
            type="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
          />
          <input
            required
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogIn && (
            <input
              required
              type="password"
              placeholder="confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          <input 
            type="submit" 
            className="create" 
            value={isLoading ? 'Processing...' : (isLogIn ? 'Login' : 'Sign Up')} 
            disabled={isLoading}
          />

        </form>

        <div className="auth-options">
          <button onClick={() => viewLogin(!isLogIn)}>
            {isLogIn ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default Auth