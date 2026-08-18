import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')

    if (!email || !password) {
      setError('Please enter email and password.')
      return
    }

    try {
      setLoading(true)

      const response = await authService.login({
        email,
        password,
      })

      console.log('Login response:', response)

      if (!response?.success || !response?.token) {
        throw new Error(
          response?.message || 'Login failed.'
        )
      }

      // Save JWT token
      localStorage.setItem('token', response.token)

      // Save logged-in user
      if (response.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(response.user)
        )
      }

      console.log('JWT token saved successfully.')

      // Go to dashboard
      navigate('/', { replace: true })

    } catch (err) {
      console.error('Login error:', err)

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to login.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 430,
          borderRadius: 4,
          boxShadow: 8,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              textAlign: 'center',
              mb: 1,
            }}
          >
            Industrial Monitoring
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 3,
            }}
          >
            Sign in to access the monitoring dashboard
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
          >

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                />
              ) : (
                'Sign In'
              )}
            </Button>

          </Box>

        </CardContent>
      </Card>
    </Box>
  )
}

export default Login