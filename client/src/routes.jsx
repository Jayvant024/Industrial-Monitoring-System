import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import ProtectedRoute from './components/ProtectedRoute'
const Login = lazy(() => import('./pages/Login/Login'))

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Machines = lazy(() => import('./pages/Machines/Machines'))
const Sensors = lazy(() => import('./pages/Sensors/Sensors'))
const Alerts = lazy(() => import('./pages/Alerts/Alerts'))
const Maintenance = lazy(() => import('./pages/Maintenance/Maintenance'))
const Reports = lazy(() => import('./pages/Reports/Reports'))
const Users = lazy(() => import('./pages/Users/Users'))
const Settings = lazy(() => import('./pages/Settings/Settings'))
const MachineDetails = lazy(() =>
  import('./pages/MachineDetails/MachineDetails')
)

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

      {/* =========================
          LOGIN
      ========================= */}
      <Route path="/login" element={<Login />} />


      {/* =========================
          PROTECTED APPLICATION
      ========================= */}
      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Machines */}
        <Route path="/machines" element={<Machines />} />
        <Route
          path="/machines/:id"
          element={<MachineDetails />}
        />

        {/* Sensors */}
        <Route path="/sensors" element={<Sensors />} />

        {/* Alerts */}
        <Route path="/alerts" element={<Alerts />} />

        {/* Maintenance */}
        <Route path="/maintenance" element={<Maintenance />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />

        {/* Users */}
        <Route path="/users" element={<Users />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

      </Route>

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  </Suspense>
)

export default AppRoutes