import api from '../api/axios'

const login = (credentials) => api.post('/api/auth/login', credentials).then(r => r.data)
const logout = () => api.post('/api/auth/logout').then(r => r.data)
const me = (token) => api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data)

export default { login, logout, me }
