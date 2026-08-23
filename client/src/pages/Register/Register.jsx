import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import {
  FaIndustry,
  FaEye,
  FaEyeSlash,
  FaArrowLeft
} from 'react-icons/fa'

import './Register.css'

const Register = ({ embedded = false, onBackToLogin }) => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear error while typing
    if (error) {
      setError('')
    }
  }

  // =========================
  // HANDLE REGISTER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    // -------------------------
    // Basic validation
    // -------------------------

    if (!formData.full_name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!formData.password) {
      setError('Please enter a password.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
            confirm_password: formData.confirm_password
          })
        }
      )

      const data = await response.json()

      console.log('Register response:', data)

      if (!response.ok || !data.success) {
        setError(
          data.message ||
          data.error ||
          'Unable to create account.'
        )

        return
      }

      // -------------------------
      // Account successfully created
      // -------------------------

      setSuccess(
        'Account created successfully! Redirecting to login...'
      )

      // Clear form
      setFormData({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: ''
      })

      setTimeout(() => {
        if (embedded) {
          onBackToLogin?.()
        } else {
          navigate('/login')
        }
      }, 1500)

    } catch (err) {
      console.error('Registration error:', err)

      setError(
        'Unable to connect to server. Please make sure the backend server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`register-page${embedded ? ' register-page-embedded' : ''}`}>

      <div className={`register-card${embedded ? ' register-card-embedded' : ''}`}>

        {/* =========================
            LOGO
        ========================== */}

        {!embedded && (
        <div className="register-brand">

          <div className="register-brand-icon">
            <FaIndustry />
          </div>

          <div>
            <h2>PlantCore</h2>
            <span>Industrial Monitoring</span>
          </div>

        </div>
        )}


        {/* =========================
            HEADING
        ========================== */}

        <div className="register-heading">

          <h1>Create Account</h1>

          <p>
            Create your PlantCore industrial monitoring account.
          </p>

        </div>


        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}


        {/* =========================
            SUCCESS
        ========================== */}

        {success && (
          <div className="register-success">
            {success}
          </div>
        )}


        {/* =========================
            REGISTRATION FORM
        ========================== */}

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}

          <div className="register-group">

            <label htmlFor="full_name">
              Full Name *
            </label>

            <input
              id="full_name"
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              autoComplete="name"
              required
            />

          </div>


          {/* EMAIL */}

          <div className="register-group">

            <label htmlFor="email">
              Email *
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

          </div>


          {/* PHONE */}

          <div className="register-group">

            <label htmlFor="phone">
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />

          </div>


          {/* PASSWORD */}

          <div className="register-group">

            <label htmlFor="password">
              Password *
            </label>

            <div className="register-password">

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
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


          {/* CONFIRM PASSWORD */}

          <div className="register-group">

            <label htmlFor="confirm_password">
              Confirm Password *
            </label>

            <div className="register-password">

              <input
                id="confirm_password"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                name="confirm_password"
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>


          {/* CREATE ACCOUNT BUTTON */}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              mt: 2,
              fontWeight: 700
            }}
          >
            {loading
              ? 'CREATING ACCOUNT...'
              : 'CREATE ACCOUNT'}
          </Button>

        </form>


        {/* =========================
            BACK TO LOGIN
        ========================== */}

        <button
          type="button"
          className="back-login"
          onClick={() => {
            if (embedded) {
              onBackToLogin?.()
            } else {
              navigate('/login')
            }
          }}
        >
          <FaArrowLeft />
          Back to Login
        </button>

      </div>

    </div>
  )
}

export default Register