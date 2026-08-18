import { Card, CardContent, Grid, Typography, Stack } from '@mui/material'
import { motion } from 'framer-motion'
import PageShell from '../../components/Layout/PageShell'

const reports = [
  { title: 'Production Summary', detail: 'Yield up 6.2% this week' },
  { title: 'Downtime Analysis', detail: '2.4% unplanned downtime' },
  { title: 'Asset Utilization', detail: '87% average utilization' },
]

const Reports = () => (
  <PageShell title="Executive Reports" subtitle="Insightful summaries for operations, maintenance, and plant leadership.">
    <Grid container spacing={3}>
      {reports.map((report, index) => (
        <Grid item xs={12} md={4} key={report.title}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card sx={{ borderRadius: 4, boxShadow: 4, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{report.title}</Typography>
                <Typography variant="body2" color="text.secondary">{report.detail}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </PageShell>
)

export default Reports
