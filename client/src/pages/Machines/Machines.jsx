import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Paper, Select, Skeleton, Stack, TextField, Typography, InputAdornment } from '@mui/material'
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa'
import PageShell from '../../components/Layout/PageShell'
import MachineCard from '../../components/Machine/MachineCard'
import { createMachine, deleteMachine, getMachines, updateMachine } from '../../services/machineService'
import { toast } from 'react-toastify'

const emptyForm = {
  machine_code: '',
  machine_name: '',
  category_id: 1,
  manufacturer: '',
  model: '',
  serial_number: '',
  location: '',
  status: 'Running',
}

const Machines = () => {
  const [machines, setMachines] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const perPage = 6

  const loadMachines = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMachines()
      setMachines(data)
    } catch (err) {
      setError('Unable to load machines from the backend.')
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  loadMachines()

  const interval = setInterval(() => {
    loadMachines()
  }, 30000)

  return () => clearInterval(interval)
}, [])

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch = `${machine.machine_name} ${machine.machine_code} ${machine.manufacturer} ${machine.location}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || machine.category_name === category
      const matchesStatus = status === 'All' || machine.status === status
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [machines, search, category, status])

  const pagedMachines = filteredMachines.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / perPage))

  const categories = ['All', ...new Set(machines.map((machine) => machine.category_name))]
  const statuses = ['All', 'Running', 'Maintenance', 'Stopped', 'Fault']

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setOpenDialog(true)
  }

  const handleOpenEdit = (machine) => {
    setEditingId(machine.machine_id)
    setForm({
      machine_code: machine.machine_code || '',
      machine_name: machine.machine_name || '',
      category_id: 1,
      manufacturer: machine.manufacturer || '',
      model: machine.model || '',
      serial_number: machine.serial_number || '',
      location: machine.location || '',
      status: machine.status || 'Running',
    })
    setOpenDialog(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await updateMachine(editingId, form)
        toast.success('Machine updated successfully')
      } else {
        await createMachine(form)
        toast.success('Machine added successfully')
      }
      setOpenDialog(false)
      await loadMachines()
    } catch (err) {
      toast.error('Unable to save the machine right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (machineId) => {
    if (!window.confirm('Delete this machine from the live system?')) return
    try {
      await deleteMachine(machineId)
      toast.success('Machine deleted successfully')
      await loadMachines()
    } catch (err) {
      toast.error('Unable to delete the machine right now.')
    }
  }

  return (
    <PageShell title="Machine Fleet" subtitle="A premium operational view for asset monitoring, status control, and diagnostics." action={<Button variant="contained" startIcon={<FaPlus />} onClick={handleOpenCreate}>Add machine</Button>}>
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      <Card sx={{ borderRadius: 4, boxShadow: 4, p: { xs: 2, md: 2.5 }, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            placeholder="Search by machine, code, location…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><FaSearch /></InputAdornment> }}
            fullWidth
          />
          <TextField select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} sx={{ minWidth: { xs: '100%', md: 180 } }}>
            {categories.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} sx={{ minWidth: { xs: '100%', md: 180 } }}>
            {statuses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <Button variant="outlined" startIcon={<FaFilter />} sx={{ minWidth: 140 }}>Filter</Button>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} xl={4} key={index}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
        ) : pagedMachines.map((machine) => (
          <Grid item xs={12} md={6} xl={4} key={machine.machine_id}>
            <MachineCard machine={machine} onEdit={handleOpenEdit} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 3, p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredMachines.length ? `${Math.min(filteredMachines.length, (page - 1) * perPage + 1)}-${Math.min(filteredMachines.length, page * perPage)}` : '0'} of {filteredMachines.length} machines
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>Previous</Button>
          <Button variant="contained" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>Next</Button>
        </Stack>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit machine' : 'Add machine'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="machine-form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Machine Code" required value={form.machine_code} onChange={(event) => setForm((prev) => ({ ...prev, machine_code: event.target.value }))} />
            <TextField label="Machine Name" required value={form.machine_name} onChange={(event) => setForm((prev) => ({ ...prev, machine_name: event.target.value }))} />
            <TextField label="Manufacturer" value={form.manufacturer} onChange={(event) => setForm((prev) => ({ ...prev, manufacturer: event.target.value }))} />
            <TextField label="Model" value={form.model} onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))} />
            <TextField label="Location" value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
            <TextField label="Serial Number" value={form.serial_number} onChange={(event) => setForm((prev) => ({ ...prev, serial_number: event.target.value }))} />
            <TextField select label="Category" value={form.category_id} onChange={(event) => setForm((prev) => ({ ...prev, category_id: Number(event.target.value) }))}>
              {[1, 2, 3, 4, 5, 6, 7].map((value) => <MenuItem key={value} value={value}>Category {value}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              {['Running', 'Stopped', 'Maintenance', 'Fault'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button type="submit" form="machine-form" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} color="inherit" /> : editingId ? 'Save changes' : 'Create machine'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  )
}

export default Machines
