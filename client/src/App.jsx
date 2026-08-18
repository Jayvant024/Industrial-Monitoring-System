import { useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from './components/Layout/Layout'
import './App.css'

function App() {
  const [mode, setMode] = useState('light')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#2563eb' },
          secondary: { main: '#38bdf8' },
          background: {
            default: mode === 'dark' ? '#020617' : '#f5f7fb',
            paper: mode === 'dark' ? '#0f172a' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
            secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
          },
        },
        shape: { borderRadius: 16 },
        typography: { fontFamily: 'Inter, "Segoe UI", sans-serif' },
      }),
    [mode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout mode={mode} onToggleTheme={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))} />
      </BrowserRouter>
      <ToastContainer position="top-right" theme={mode === 'dark' ? 'dark' : 'light'} />
    </ThemeProvider>
  )
}

export default App
