import { Card, CardContent, Grid, Typography, Stack, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import PageShell from '../../components/Layout/PageShell'

const settings = [
  { title: 'Theme Mode', detail: 'Dark-ready UI with adaptive surfaces' },
  { title: 'Alert Routing', detail: 'Escalation rules configured' },
  { title: 'Data Sync', detail: 'Machine telemetry polling active' },
]

const Settings = () => (
  <PageShell title="System Settings" subtitle="Configure the operating environment for plant-wide control and monitoring.">
    <Grid container spacing={3}>
      {settings.map((setting, index) => (
        <Grid item xs={12} md={4} key={setting.title}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 4, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{setting.title}</Typography>
                  <Chip label="Configured" color="success" />
                </Stack>
                <Typography variant="body2" color="text.secondary">{setting.detail}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </PageShell>
)

export default Settings
