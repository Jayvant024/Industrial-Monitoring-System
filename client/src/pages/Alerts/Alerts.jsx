import { Card, CardContent, Grid, Stack, Typography, Chip, Box } from '@mui/material'
import { motion } from 'framer-motion'
import PageShell from '../../components/Layout/PageShell'

const alerts = [
  { title: 'Vibration anomaly', machine: 'Hydraulic Press', severity: 'Critical', time: '2 min ago' },
  { title: 'Thermal drift', machine: 'Boiler', severity: 'Warning', time: '18 min ago' },
  { title: 'Maintenance due', machine: 'CNC Mill', severity: 'Info', time: '1 hr ago' },
]

const Alerts = () => (
  <PageShell title="Operational Alerts" subtitle="Prioritized notifications to keep plant operations resilient and safe.">
    <Grid container spacing={3}>
      {alerts.map((alert, index) => (
        <Grid item xs={12} md={4} key={alert.title}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 4, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{alert.title}</Typography>
                  <Chip label={alert.severity} size="small" color={alert.severity === 'Critical' ? 'error' : alert.severity === 'Warning' ? 'warning' : 'info'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">{alert.machine}</Typography>
                <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </PageShell>
)

export default Alerts
