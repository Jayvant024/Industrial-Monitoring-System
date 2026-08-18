import { Card, CardContent, Grid, Stack, Typography, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import PageShell from '../../components/Layout/PageShell'

const maintenanceTasks = [
  { title: 'Lubrication cycle', asset: 'Hydraulic Press', status: 'Scheduled', due: 'Today' },
  { title: 'Spindle calibration', asset: 'CNC Center', status: 'In Progress', due: 'Tomorrow' },
  { title: 'Filter replacement', asset: 'Compressor', status: 'Pending', due: 'Friday' },
]

const Maintenance = () => (
  <PageShell title="Maintenance Planner" subtitle="Coordinate preventive maintenance and work orders with precision.">
    <Grid container spacing={3}>
      {maintenanceTasks.map((task, index) => (
        <Grid item xs={12} md={4} key={task.title}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 4, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{task.title}</Typography>
                  <Chip label={task.status} size="small" color={task.status === 'In Progress' ? 'warning' : 'info'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">{task.asset}</Typography>
                <Typography variant="caption" color="text.secondary">Due {task.due}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </PageShell>
)

export default Maintenance
