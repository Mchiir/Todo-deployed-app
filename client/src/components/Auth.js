import { useState } from "react"
import { useCookies } from 'react-cookie'

const Auth = () => {
  const [cookies, setCookie, removeCookie] = useCookies(null)
  const [isLogIn, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [err, setErr] = useState(null)

  // console.log("Cookies", cookies)

  const viewLogin = (status) => {
    setErr(null)
    setIsLogin(status)
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr(null)

    // Validate email
    if (!email || !validateEmail(email)) {
      setTimeout(() => {
        setErr('Please enter a valid email address.')
      }, 500)
      return
    }

    // Validate password
    if (!password) {
      setTimeout(() => {
        setErr('Please enter your password.')
      }, 500)
      return
    }

    // Validate confirm password if signing up
    if (!isLogIn && password !== confirmPassword) {
      setTimeout(() => {
        setErr('Passwords do not match!')
      }, 500)
      return
    }

    const endpoint = isLogIn ? 'login' : 'signup'
    const response = await fetch(`${process.env.REACT_APP_SERVERURL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (data.detail) {
      setError(data.detail)
    } else {
      setCookie('Email', data.email)
      setCookie('AuthToken', data.token)
      setErr(null)
      window.location.reload()
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-container-box">
        <form onSubmit={handleSubmit}>
          <h2>{isLogIn ? 'Please log in' : 'Please sign up!'}</h2>
          <p className="error-space">{err}</p>
          <input
            required
            type="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
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
          <input type="submit" className="create" value={isLogIn ? 'Login' : 'Sign Up'} />
          {error && <p>{error}</p>}
        </form>

      </div>
    </div>
  )
}

export default Auth