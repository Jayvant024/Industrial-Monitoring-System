import { Card, CardContent, CardMedia, Chip, Stack, Typography, Button, Box } from '@mui/material'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaEdit, FaTrash } from 'react-icons/fa'

const MachineCard = ({ machine, onEdit, onDelete }) => (
  <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.2 }}>
    <Card
      sx={{
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 3,
        border: '1px solid rgba(16,24,40,0.04)',
        background: (theme) => `linear-gradient(180deg, ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(20,20,20,0.6)'}, transparent)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
  sx={{
    width: '100%',
    height: { xs: 140, sm: 160, md: 200 },
    overflow: 'hidden',
  }}
>
  <CardMedia
    component="img"
    image={machine.image}
    alt={machine.machine_name}
    sx={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    }}
  />
</Box>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flex: '1 1 auto' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {machine.machine_name}
          </Typography>
          <Chip
            label={machine.status}
            size="small"
            color={machine.status === 'Running' ? 'success' : machine.status === 'Maintenance' ? 'warning' : 'error'}
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {machine.machine_code} • {machine.manufacturer}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          {machine.location}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip label={machine.category_name} size="small" variant="outlined" />
          <Chip label={`Health ${machine.health}%`} size="small" color={machine.health > 85 ? 'success' : machine.health > 70 ? 'warning' : 'error'} />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
          <Button
            component={Link}
            to={`/machines/${machine.machine_id}`}
            variant="contained"
            endIcon={<FaArrowRight />}
            sx={{ borderRadius: 999, px: 2.2, flex: { xs: 'none', sm: 1 }, width: { xs: '100%', sm: 'auto' } }}
          >
            View
          </Button>
          <Button
            variant="outlined"
            startIcon={<FaEdit />}
            onClick={() => onEdit(machine)}
            sx={{ borderRadius: 999, px: 1.8, width: { xs: '100%', sm: 'auto' } }}
          >
            Edit
          </Button>
          <Button
            color="error"
            variant="outlined"
            startIcon={<FaTrash />}
            onClick={() => onDelete(machine.machine_id)}
            sx={{ borderRadius: 999, px: 1.8, width: { xs: '100%', sm: 'auto' } }}
          >
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  </motion.div>
)

export default MachineCard
