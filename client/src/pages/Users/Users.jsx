import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'
import PageShell from '../../components/Layout/PageShell'
import userService from '../../services/userService'

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role_id: '',
  department_id: '',
  status: 'Active',
  profile_image: '',
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status) => {
  if (status === 'Active') return 'success'
  if (status === 'Inactive') return 'error'
  return 'info'
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U'

const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [formValues, setFormValues] = useState(emptyForm)
  const [selectedFile, setSelectedFile] = useState(null)

  const loadOptions = async () => {
    try {
      const [rolesResponse, departmentsResponse] = await Promise.all([
        userService.getRoles(),
        userService.getDepartments(),
      ])
      setRoles(Array.isArray(rolesResponse?.data) ? rolesResponse.data : [])
      setDepartments(Array.isArray(departmentsResponse?.data) ? departmentsResponse.data : [])
    } catch (err) {
      console.error('Failed to load roles or departments', err)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await userService.getUsers({
        search,
        role_id: roleFilter === 'All' ? '' : roleFilter,
        department_id: departmentFilter === 'All' ? '' : departmentFilter,
        status: statusFilter === 'All' ? '' : statusFilter,
      })

      setUsers(Array.isArray(response?.data) ? response.data : [])
    } catch (err) {
      console.error('Failed to load users', err)
      setError('Unable to load users at the moment.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOptions()
    loadUsers()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 200)
    return () => clearTimeout(timer)
  }, [search, roleFilter, departmentFilter, statusFilter])

  const roleOptions = useMemo(() => roles, [roles])
  const departmentOptions = useMemo(() => departments, [departments])

  const openCreateDialog = () => {
    setSelectedUser(null)
    setIsEditing(false)
    setFormValues(emptyForm)
    setSelectedFile(null)
    setDialogOpen(true)
    setError('')
    setSuccess('')
  }

  const openEditDialog = (user) => {
    setSelectedUser(user)
    setIsEditing(true)
    setFormValues({
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      phone: user.phone || '',
      role_id: user.role_id ? String(user.role_id) : '',
      department_id: user.department_id ? String(user.department_id) : '',
      status: user.status || 'Active',
      profile_image: user.profile_image || '',
    })
    setSelectedFile(null)
    setDialogOpen(true)
    setError('')
    setSuccess('')
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSelectedUser(null)
    setIsEditing(false)
    setFormValues(emptyForm)
    setSelectedFile(null)
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!formValues.full_name?.trim()) {
      setError('Full name is required.')
      return
    }

    if (!formValues.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!isEditing && (!formValues.password || !formValues.confirmPassword)) {
      setError('Password and confirm password are required for new users.')
      return
    }

    if (!isEditing && formValues.password !== formValues.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formValues.role_id) {
      setError('Please select a role.')
      return
    }

    if (formValues.status !== 'Active' && formValues.status !== 'Inactive') {
      setError('Status must be Active or Inactive.')
      return
    }

    const payload = new FormData()
    payload.append('full_name', formValues.full_name)
    payload.append('email', formValues.email)
    payload.append('phone', formValues.phone || '')
    payload.append('role_id', formValues.role_id)
    payload.append('department_id', formValues.department_id || '')
    payload.append('status', formValues.status)

    if (selectedFile) {
      payload.append('profile_image', selectedFile)
    } else if (formValues.profile_image && typeof formValues.profile_image === 'string') {
      payload.append('profile_image', formValues.profile_image)
    }

    if (!isEditing) {
      payload.append('password', formValues.password)
    }

    try {
      if (isEditing && selectedUser) {
        await userService.updateUser(selectedUser.user_id, payload)
        setSuccess('User updated successfully.')
      } else {
        await userService.createUser(payload)
        setSuccess('User created successfully.')
      }
      closeDialog()
      await loadUsers()
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || 'An unexpected error occurred.'
      setError(message)
    }
  }

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this user?`)
    if (!confirmDelete) return

    try {
      await userService.deleteUser(user.user_id)
      setSuccess('User deleted successfully.')
      await loadUsers()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user.')
    }
  }

  return (
    <PageShell
      title="Users"
      subtitle="Manage system users, roles and access."
      action={
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2, px: 2.5, py: 1.1 }}
        >
          + Add New User
        </Button>
      }
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      ) : null}

      {success ? (
        <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
          {success}
        </Alert>
      ) : null}

      <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 2, width: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, mb: 3, alignItems: { xs: 'stretch', lg: 'center' }, width: '100%' }}>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch size={14} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 0, flex: 1 }}
          />

          <Select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            displayEmpty
            sx={{ minWidth: 180, width: { xs: '100%', lg: 'auto' } }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            {roleOptions.map((role) => (
              <MenuItem key={role.role_id} value={role.role_id}>
                {role.role_name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            displayEmpty
            sx={{ minWidth: 200, width: { xs: '100%', lg: 'auto' } }}
          >
            <MenuItem value="All">All Departments</MenuItem>
            {departmentOptions.map((department) => (
              <MenuItem key={department.department_id} value={department.department_id}>
                {department.department_name}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            displayEmpty
            sx={{ minWidth: 150, width: { xs: '100%', lg: 'auto' } }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Profile</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">Loading users...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography variant="body2" color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Avatar
                        src={user.profile_image ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.profile_image}` : undefined}
                        sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}
                      >
                        {!user.profile_image && <FaUser />}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                        {user.full_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{user.email}</Typography>
                    </TableCell>
                    <TableCell>{user.role_name || '—'}</TableCell>
                    <TableCell>{user.department_name || '—'}</TableCell>
                    <TableCell>
                      <Chip label={user.status || 'Active'} color={getStatusColor(user.status)} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(user.last_login)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => setSelectedUser(user)}
                          startIcon={<FaEye />}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => openEditDialog(user)}
                          startIcon={<FaEdit />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(user)}
                          startIcon={<FaTrash />}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={!!selectedUser && !dialogOpen} onClose={() => setSelectedUser(null)} maxWidth="md" fullWidth>
        {selectedUser && (
          <Box sx={{ p: 2 }}>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={selectedUser.profile_image ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${selectedUser.profile_image}` : undefined}
                  sx={{ width: 68, height: 68, bgcolor: 'primary.main', fontSize: 24 }}
                >
                  {!selectedUser.profile_image && getInitials(selectedUser.full_name)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedUser.full_name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Chip label={selectedUser.status || 'Active'} color={getStatusColor(selectedUser.status)} size="small" />
                    <Typography variant="body2" color="text.secondary">{selectedUser.role_name || '—'}</Typography>
                  </Stack>
                </Box>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Personal Information</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedUser.full_name}</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{selectedUser.email}</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">{selectedUser.phone || '—'}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Work Information</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Role</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedUser.role_name || '—'}</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Department</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedUser.department_name || '—'}</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip label={selectedUser.status || 'Active'} color={getStatusColor(selectedUser.status)} size="small" />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="overline" color="text.secondary">Account Information</Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Last Login</Typography>
                      <Typography variant="body1">{formatDate(selectedUser.last_login)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Created</Typography>
                      <Typography variant="body1">{formatDate(selectedUser.created_at)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Updated</Typography>
                      <Typography variant="body1">{formatDate(selectedUser.updated_at)}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setSelectedUser(null)} color="inherit">Close</Button>
              <Button variant="contained" color="primary" onClick={() => openEditDialog(selectedUser)}>Edit User</Button>
              <Button variant="outlined" color="error" onClick={() => handleDelete(selectedUser)}>Delete User</Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formValues.full_name}
                  onChange={handleFieldChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleFieldChange}
                  required
                />
              </Grid>

              {!isEditing && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formValues.password}
                      onChange={handleFieldChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formValues.confirmPassword}
                      onChange={handleFieldChange}
                      required
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleFieldChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="file"
                  label="Profile Image"
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  name="role_id"
                  value={formValues.role_id}
                  onChange={handleFieldChange}
                  required
                >
                  <MenuItem value="">Select role</MenuItem>
                  {roleOptions.map((role) => (
                    <MenuItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="department_id"
                  value={formValues.department_id}
                  onChange={handleFieldChange}
                >
                  <MenuItem value="">Select department</MenuItem>
                  {departmentOptions.map((department) => (
                    <MenuItem key={department.department_id} value={department.department_id}>
                      {department.department_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formValues.status}
                  onChange={handleFieldChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageShell>
  )
}

export default Users
