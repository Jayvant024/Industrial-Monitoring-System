import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import {
  FaEye,
  FaEyeSlash,
  FaIndustry,
  FaShieldAlt
} from 'react-icons/fa'

import Register from '../Register/Register'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()

  const [showRegister, setShowRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')

    } catch (error) {
      console.error('Login error:', error)

      setError(
        'Unable to connect to server. Please make sure the backend server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ================= LEFT FORM ================= */}
      <div className="login-form-section">

        <div className="login-form-wrapper">

          {/* Logo */}
          <div className="login-brand">

            <div className="brand-icon">
              <FaIndustry />
            </div>

            <div>
              <h2>PlantCore</h2>
              <span>Industrial Monitoring</span>
            </div>

          </div>


          {showRegister ? (
            <Register
              embedded
              onBackToLogin={() => {
                setError('')
                setShowRegister(false)
              }}
            />
          ) : (
            <>
          {/* Heading */}
          <div className="login-heading">

            <h1>Welcome Back</h1>

            <p>
              Sign in to access your industrial
              monitoring dashboard.
            </p>

          </div>


          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* ================= LOGIN FORM ================= */}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="admin@industrial.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>


            {/* Password */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>


            {/* Remember + Forgot */}
            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  setError(
                    'Please contact your system administrator to reset your password.'
                  )
                }
              >
                Forgot password?
              </button>

            </div>


            {/* Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                mt: 2
              }}
            >

              {/* LOGIN */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700
                }}
              >
                {loading
                  ? 'SIGNING IN...'
                  : 'SIGN IN'}
              </Button>


              {/* CREATE ACCOUNT */}
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() =>
                  navigate('/register')
                }
                sx={{
                  py: 1.5,
                  fontWeight: 700
                }}
              >
                CREATE ACCOUNT
              </Button>

            </Box>

          </form>
            </>
          )}


          {/* Security */}
          <div className="login-security">

            <FaShieldAlt />

            <span>
              Secure access • Authorized personnel only
            </span>

          </div>


          {/* Footer */}
          <div className="login-footer">
            © 2026 PlantCore Industrial Monitoring
          </div>

        </div>

      </div>


      {/* ================= RIGHT VISUAL ================= */}

      <div className="login-visual-section">

        {/* Background image */}
        <div className="industrial-background" />

        {/* Dark overlay */}
        <div className="industrial-overlay" />


        {/* Content */}
        <div className="industrial-content">

          <div className="live-badge">

            <span className="live-dot" />

            LIVE INDUSTRIAL OPERATIONS

          </div>


          <h2>
            Monitor.
            <br />
            Control.
            <br />
            <span>Optimize.</span>
          </h2>


          <p>
            Real-time visibility into your machines,
            sensors and industrial operations.
          </p>


          {/* Status cards */}
          <div className="industrial-stats">

            <div className="stat-card">

              <div className="stat-value">
                16
              </div>

              <div className="stat-label">
                Machines Online
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-value">
                98.6%
              </div>

              <div className="stat-label">
                System Health
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-value">
                24/7
              </div>

              <div className="stat-label">
                Monitoring
              </div>

            </div>

          </div>


          {/* Machine status */}
          <div className="machine-status">

            <span className="status-indicator" />

            <div>

              <strong>
                Production System
              </strong>

              <small>
                All systems operational
              </small>

            </div>

          </div>

        </div>


        {/* Decorative grid */}
        <div className="visual-grid" />

      </div>

    </div>
  )
}

export default Login