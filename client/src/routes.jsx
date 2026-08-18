import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'

const Login = lazy(() => import('./pages/Login/Login'))

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Machines = lazy(() => import('./pages/Machines/Machines'))
const Sensors = lazy(() => import('./pages/Sensors/Sensors'))
const Alerts = lazy(() => import('./pages/Alerts/Alerts'))
const Maintenance = lazy(() => import('./pages/Maintenance/Maintenance'))
const Reports = lazy(() => import('./pages/Reports/Reports'))
const Users = lazy(() => import('./pages/Users/Users'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const MachineDetails = lazy(() => import('./pages/MachineDetails/MachineDetails'))

const loadingFallback = (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
)

const AppRoutes = () => (
  <Suspense fallback={loadingFallback}>
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* MAIN APPLICATION */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/machines" element={<Machines />} />
      <Route path="/machines/:id" element={<MachineDetails />} />
      <Route path="/sensors" element={<Sensors />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/maintenance" element={<Maintenance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/users" element={<Users />} />
      <Route path="/settings" element={<Settings />} />

    </Routes>
  </Suspense>
)

export default AppRoutes