import api from '../api/axios'

const getToken = () => {
  if (typeof window === 'undefined') return ''

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('jwt') ||
    sessionStorage.getItem('authToken') ||
    ''
  )
}

const buildHeaders = (extra = {}) => {
  const token = getToken()

  const headers = {
    ...extra,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

// =========================
// GET ALL USERS
// =========================
const getUsers = (filters = {}) =>
  api.get('/api/users', {
    params: filters,
    headers: buildHeaders(),
  }).then((response) => response.data)


// =========================
// GET USER BY ID
// =========================
const getUser = (id) =>
  api.get(`/api/users/${id}`, {
    headers: buildHeaders(),
  }).then((response) => response.data)


// =========================
// GET ROLES
// =========================
const getRoles = () =>
  api.get('/api/roles', {
    headers: buildHeaders(),
  }).then(r => r.data)

const getDepartments = () =>
  api.get('/api/departments', {
    headers: buildHeaders(),
  }).then(r => r.data)


// =========================
// CREATE USER
// =========================
const createUser = (formData) =>
  api.post('/api/users', formData, {
    headers: buildHeaders({
      'Content-Type': 'multipart/form-data',
    }),
  }).then((response) => response.data)


// =========================
// UPDATE USER
// =========================
const updateUser = (id, formData) =>
  api.put(`/api/users/${id}`, formData, {
    headers: buildHeaders({
      'Content-Type': 'multipart/form-data',
    }),
  }).then((response) => response.data)


// =========================
// DELETE USER
// =========================
const deleteUser = (id) =>
  api.delete(`/api/users/${id}`, {
    headers: buildHeaders(),
  }).then((response) => response.data)


export default {
  getUsers,
  getUser,
  getRoles,
  getDepartments,
  createUser,
  updateUser,
  deleteUser,
}