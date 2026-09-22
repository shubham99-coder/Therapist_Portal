import axios from 'axios'

export const TOKEN_KEY = 'unfazed_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If the token is rejected on a protected call, tell AuthContext to log out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const isAuthCall = url.includes('/auth/')
    if (err.response?.status === 401 && !isAuthCall) {
      window.dispatchEvent(new Event('auth:expired'))
    }
    return Promise.reject(err)
  },
)

export default api
