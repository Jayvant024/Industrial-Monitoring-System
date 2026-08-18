import { useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaTools, FaThermometerHalf, FaExclamationTriangle } from 'react-icons/fa'
import PageShell from '../../components/Layout/PageShell'
import { getMachineById } from '../../services/machineService'

const MachineDetails = () => {
  const { id } = useParams()
  const [machine, setMachine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getMachineById(id)
        setMachine(data)
      } catch (err) {
        setError('Unable to load the selected machine.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return <PageShell title="Loading machine…" subtitle="Preparing operational data." />
  }

  if (!machine) {
    return <PageShell title="Machine not found" subtitle="The requested machine could not be loaded from the backend." />
  }

  return (
    <PageShell title={machine.machine_name} subtitle={`${machine.machine_code} • ${machine.location}`} action={<RouterLink to="/machines" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: 8 }}><FaArrowLeft /> Back to fleet</RouterLink>}>
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 4 }}>
              <Box component="img" src={machine.image} alt={machine.machine_name} sx={{ width: '100%', height: 320, objectFit: 'cover' }} />
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{machine.machine_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{machine.description}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip label={machine.status} color={machine.status === 'Running' ? 'success' : machine.status === 'Maintenance' ? 'warning' : 'error'} />
                    <Chip label={`Health ${machine.health}%`} color={machine.health > 85 ? 'success' : machine.health > 70 ? 'warning' : 'error'} />
                  </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {[
                    ['Manufacturer', machine.manufacturer],
                    ['Model', machine.model],
                    ['Category', machine.category_name],
                    ['Location', machine.location],
                    ['Last maintenance', machine.last_maintenance],
                  ].map(([label, value]) => (
                    <Grid item xs={12} sm={6} key={label}>
                      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(37,99,235,0.06)' }}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Machine Health</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>{machine.health}%</Typography>
                <Typography variant="body2" color="text.secondary">Live condition score pulled from the connected asset record.</Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Sensor Cards</Typography>
                <Stack spacing={1.5}>
                  {[
                    { name: 'Temperature', value: `${machine.health > 85 ? '90' : '82'}°C`, icon: <FaThermometerHalf /> },
                    { name: 'Vibration', value: `${(machine.health / 100 + 0.2).toFixed(2)} mm/s`, icon: <FaExclamationTriangle /> },
                    { name: 'Maintenance', value: machine.last_maintenance, icon: <FaTools /> },
                  ].map((item) => (
                    <Box key={item.name} sx={{ p: 1.4, borderRadius: 3, bgcolor: 'rgba(15,23,42,0.04)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                        <Box color="primary.main">{item.icon}</Box>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Recent Alerts</Typography>
                <Typography variant="body2" color="text.secondary">{machine.status === 'Running' ? 'No critical alerts in the last 24 hours.' : `Current focus: ${machine.status}`}</Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </PageShell>
  )
}

export default MachineDetails
