import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'framer-motion'
import { FaArrowRight, FaChartLine, FaExclamationTriangle, FaIndustry, FaTools } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import PageShell from '../../components/Layout/PageShell'
import { getMachines } from '../../services/machineService'
import { getSensorStatuses } from '../../services/sensorService'

const palette = ['#2563eb', '#38bdf8', '#0f172a', '#f59e0b']

const getStatusColor = (status) => {
  switch (status) {
    case 'Running':
      return 'success'
    case 'Warning':
    case 'Maintenance':
      return 'warning'
    case 'Critical':
    case 'Fault':
    case 'Stopped':
      return 'error'
    default:
      return 'info'
  }
}

const getSensorStatusColor = (status) => {
  switch (status) {
    case 'Critical':
      return 'error'
    case 'Warning':
      return 'warning'
    case 'Normal':
      return 'success'
    default:
      return 'info'
  }
}

const Dashboard = () => {
  const [machines, setMachines] = useState([])
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [sensorLoading, setSensorLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      setSensorLoading(true)
      setError('')

      try {
        const [machineData, sensorData] = await Promise.all([
          getMachines(),
          getSensorStatuses(),
        ])

        setMachines(machineData)
        setSensors(sensorData)
      } catch (err) {
        console.error('Dashboard data error:', err)
        setError('Unable to load live monitoring data at the moment.')
      } finally {
        setLoading(false)
        setSensorLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [machineData, sensorData] = await Promise.all([
          getMachines(),
          getSensorStatuses(),
        ])

        setMachines(machineData)
        setSensors(sensorData)
      } catch (err) {
        console.error('Dashboard live refresh error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => {
    const running = machines.filter((machine) => machine.status === 'Running').length
    const stopped = machines.filter((machine) => machine.status === 'Stopped').length
    const maintenance = machines.filter((machine) => machine.status === 'Maintenance').length
    const critical = machines.filter((machine) => machine.status === 'Fault' || machine.health < 70).length
    const avgHealth = machines.length
      ? Math.round(machines.reduce((acc, item) => acc + Number(item.health ?? 0), 0) / machines.length)
      : 0

    return [
      { title: 'Total Machines', value: machines.length, icon: <FaIndustry />, color: 'primary' },
      { title: 'Running Machines', value: running, icon: <FaChartLine />, color: 'success' },
      { title: 'Stopped Machines', value: stopped, icon: <FaExclamationTriangle />, color: 'error' },
      { title: 'Maintenance Machines', value: maintenance, icon: <FaTools />, color: 'warning' },
      { title: 'Critical Alerts', value: critical, icon: <FaExclamationTriangle />, color: 'error' },
      { title: 'Machine Health %', value: `${avgHealth}%`, icon: <FaChartLine />, color: 'info' },
    ]
  }, [machines])

  const pieData = useMemo(
    () => [
      { name: 'Running', value: machines.filter((machine) => machine.status === 'Running').length },
      { name: 'Maintenance', value: machines.filter((machine) => machine.status === 'Maintenance').length },
      { name: 'Stopped', value: machines.filter((machine) => machine.status === 'Stopped').length },
      { name: 'Fault', value: machines.filter((machine) => machine.status === 'Fault').length },
    ],
    [machines],
  )

  const categoryData = useMemo(() => {
    const grouped = machines.reduce((acc, machine) => {
      const categoryName = machine.category_name || 'Industrial'
      acc[categoryName] = (acc[categoryName] || 0) + 1
      return acc
    }, {})

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [machines])

  const healthTrend = useMemo(
    () =>
      machines.map((machine, index) => ({
        name: machine.machine_code || `M${index + 1}`,
        health: Number(machine.health ?? 0),
      })),
    [machines],
  )

  const alerts = useMemo(
    () =>
      machines
        .filter((machine) => machine.health < 80 || machine.status !== 'Running')
        .slice(0, 4),
    [machines],
  )

  const sensorStats = useMemo(() => {
    const normal = sensors.filter((sensor) => sensor.status === 'Normal').length
    const warning = sensors.filter((sensor) => sensor.status === 'Warning').length
    const critical = sensors.filter((sensor) => sensor.status === 'Critical').length

    return { normal, warning, critical }
  }, [sensors])

  const sensorsByMachine = useMemo(() => {
    return sensors.reduce((groups, sensor) => {
      const machineId = sensor.machine_id

      if (!groups[machineId]) {
        groups[machineId] = {
          machine_id: machineId,
          machine_name: sensor.machine_name,
          sensors: [],
        }
      }

      groups[machineId].sensors.push(sensor)
      return groups
    }, {})
  }, [sensors])

  const summaryCards = useMemo(
    () => [
      { title: 'Fault Machines', value: machines.filter((machine) => machine.status === 'Fault').length, color: 'error' },
      { title: 'Warning Sensors', value: sensorStats.warning, color: 'warning' },
      { title: 'Critical Sensors', value: sensorStats.critical, color: 'error' },
      { title: 'Maintenance Machines', value: machines.filter((machine) => machine.status === 'Maintenance').length, color: 'warning' },
    ],
    [machines, sensorStats],
  )

  return (
    <PageShell
      title="Operations Command Center"
      subtitle="Executive visibility into equipment health, availability, and maintenance risk."
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 3, width: '100%', boxSizing: 'border-box' }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          maxWidth: 'none',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Skeleton variant="rectangular" height={118} sx={{ borderRadius: 3, width: '100%' }} />
              </Grid>
            ))
          ) : (
            stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={stat.title} sx={{ minWidth: 0 }}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      height: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      minHeight: 110,
                      borderRadius: 3,
                      boxShadow: 2,
                      border: '1px solid rgba(148, 163, 184, 0.14)',
                    }}
                  >
                    <CardContent
                      sx={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        p: { xs: 1.5, sm: 2 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '100%',
                        gap: 1,
                        '&:last-child': { pb: { xs: 1.5, sm: 2 } },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'break-word' }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          {stat.value}
                        </Typography>
                      </Box>

                      <Avatar
                        sx={{
                          bgcolor: (theme) => theme.palette[stat.color]?.main || theme.palette.primary.main,
                          width: 46,
                          height: 46,
                          flexShrink: 0,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        <Grid container spacing={2.5} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
          <Grid item xs={12} lg={7} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                borderRadius: 3,
                boxShadow: 2,
                p: { xs: 1.5, sm: 2 },
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Machine Health Trend
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2, width: '100%' }} />
              ) : (
                <Box sx={{ width: '100%', height: 320, minWidth: 0, boxSizing: 'border-box' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthTrend} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} minTickGap={10} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={38} />
                      <Tooltip />
                      <Line type="monotone" dataKey="health" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={5} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                borderRadius: 3,
                boxShadow: 2,
                p: { xs: 1.5, sm: 2 },
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Machine Status
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2, width: '100%' }} />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 320,
                    minWidth: 0,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={62} outerRadius={96} paddingAngle={2}>
                        {pieData.map((entry, index) => (
                          <Cell key={entry.name} fill={palette[index % palette.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {!loading && (
                <Stack direction="row" justifyContent="center" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 1.5, width: '100%' }}>
                  {pieData.map((item, index) => (
                    <Chip
                      key={item.name}
                      label={`${item.name}: ${item.value}`}
                      size="small"
                      sx={{
                        backgroundColor: `${palette[index % palette.length]}22`,
                        color: palette[index % palette.length],
                        fontWeight: 700,
                        maxWidth: '100%',
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
          <Grid item xs={12} lg={6} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                borderRadius: 3,
                boxShadow: 2,
                p: { xs: 1.5, sm: 2 },
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Machine Category Mix
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, width: '100%' }} />
              ) : (
                <Box sx={{ width: '100%', height: 300, minWidth: 0, boxSizing: 'border-box' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbe3f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} minTickGap={10} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#38bdf8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={6} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                borderRadius: 3,
                boxShadow: 2,
                p: { xs: 1.5, sm: 2 },
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Recent Alerts
              </Typography>

              <Stack spacing={1.5} sx={{ width: '100%', minWidth: 0 }}>
                {loading ? (
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, width: '100%' }} />
                ) : alerts.length ? (
                  alerts.map((alert) => (
                    <Box
                      key={alert.machine_id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid rgba(148,163,184,0.18)',
                        backgroundColor: 'rgba(37,99,235,0.04)',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%', minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, overflowWrap: 'break-word', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                          {alert.machine_name}
                        </Typography>
                        <Chip label={alert.status} size="small" color={getStatusColor(alert.status)} sx={{ flexShrink: 0 }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {alert.location}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                    No active alerts detected.
                  </Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Grid item xs={12} sx={{ width: '100%', minWidth: 0 }}>
          <Card
            sx={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              borderRadius: 3,
              boxShadow: 2,
              p: { xs: 1.5, sm: 2 },
              overflow: 'hidden',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
              sx={{ mb: 2, width: '100%', minWidth: 0 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Recent Machines
              </Typography>
              <Chip label="Connected to live API" color="primary" variant="outlined" size="small" />
            </Stack>

            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} xl={3} key={index}>
                    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3, width: '100%' }} />
                  </Grid>
                ))
              ) : (
                machines.slice(0, 8).map((machine) => (
                  <Grid item xs={12} sm={6} md={4} xl={3} key={machine.machine_id} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 3,
                        border: '1px solid rgba(148,163,184,0.18)',
                        backgroundColor: (theme) => theme.palette.background.paper,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%', minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {machine.machine_name}
                        </Typography>
                        <Chip label={machine.status} size="small" color={getStatusColor(machine.status)} sx={{ flexShrink: 0 }} />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {machine.machine_code}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {machine.location}
                      </Typography>

                      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(148,163,184,0.18)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%', minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                            {machine.health}%
                          </Typography>
                          <Link
                            to={`/machines/${machine.machine_id}`}
                            style={{
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            View <FaArrowRight />
                          </Link>
                        </Stack>
                      </Box>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} sx={{ width: '100%', minWidth: 0 }}>
          <Card
            sx={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              borderRadius: 3,
              boxShadow: 2,
              p: { xs: 1.5, sm: 2 },
              overflow: 'hidden',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
              sx={{ mb: 3, width: '100%', minWidth: 0 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                  Live Sensor Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                  Real-time machine sensor telemetry
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ width: '100%', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Chip label={`${sensorStats.normal} Normal`} color="success" size="small" />
                <Chip label={`${sensorStats.warning} Warning`} color="warning" size="small" />
                <Chip label={`${sensorStats.critical} Critical`} color="error" size="small" />
              </Stack>
            </Stack>

            {sensorLoading ? (
              <Grid container spacing={2} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3, width: '100%' }} />
                  </Grid>
                ))}
              </Grid>
            ) : sensors.length === 0 ? (
              <Typography color="text.secondary" sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                No live sensor data available.
              </Typography>
            ) : (
              Object.values(sensorsByMachine).map((machine) => {
                const machineWarnings = machine.sensors.filter((sensor) => sensor.status === 'Warning').length
                const machineCritical = machine.sensors.filter((sensor) => sensor.status === 'Critical').length

                return (
                  <Box key={machine.machine_id} sx={{ mb: 4, width: '100%', minWidth: 0, '&:last-child': { mb: 0 } }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                      sx={{ mb: 2, pb: 1.5, borderBottom: '2px solid rgba(37,99,235,0.15)', width: '100%', minWidth: 0 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, width: '100%' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2563eb', flexShrink: 0 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          {machine.machine_name}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {machineWarnings > 0 && <Chip label={`${machineWarnings} Warning`} color="warning" size="small" />}
                        {machineCritical > 0 && <Chip label={`${machineCritical} Critical`} color="error" size="small" />}
                        {machineWarnings === 0 && machineCritical === 0 && <Chip label="All Normal" color="success" size="small" />}
                      </Stack>
                    </Stack>

                    <Grid container spacing={2} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
                      {machine.sensors.map((sensor) => {
                        const borderColor =
                          sensor.status === 'Critical'
                            ? '#ef4444'
                            : sensor.status === 'Warning'
                              ? '#f97316'
                              : '#36934a'

                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={sensor.machine_sensor_id} sx={{ minWidth: 0 }}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ height: '100%' }}>
                              <Card
                                variant="outlined"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  minWidth: 0,
                                  boxSizing: 'border-box',
                                  minHeight: 180,
                                  borderRadius: 3,
                                  border: `1.5px solid ${borderColor}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                                }}
                              >
                                <CardContent sx={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                      {sensor.sensor_name}
                                    </Typography>
                                    <Chip label={sensor.status} color={getSensorStatusColor(sensor.status)} size="small" sx={{ flexShrink: 0 }} />
                                  </Stack>

                                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, mb: 1, fontSize: { xs: 26, sm: 30 }, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                    {Number(sensor.reading_value).toFixed(2)}
                                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.8, fontWeight: 600 }}>
                                      {sensor.unit}
                                    </Typography>
                                  </Typography>

                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                      Warning: {sensor.warning_value} {sensor.unit}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                      Critical: {sensor.critical_value} {sensor.unit}
                                    </Typography>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Box>
                )
              })
            )}
          </Card>
        </Grid>

        <Grid item xs={12} sx={{ width: '100%', minWidth: 0 }}>
          <Card
            sx={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              borderRadius: 3,
              boxShadow: 2,
              p: { xs: 1.5, sm: 2 },
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              Alert / Fault Summary
            </Typography>

            <Grid container spacing={2} sx={{ width: '100%', m: 0, boxSizing: 'border-box' }}>
              {summaryCards.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.title} sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) => theme.palette[item.color]?.main || theme.palette.primary.main,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      minHeight: 90,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <FaExclamationTriangle size={20} style={{ flexShrink: 0 }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Box>
    </PageShell>
  )
}

export default Dashboard
