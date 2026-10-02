import axios from 'axios'

export const CLIENT_TOKEN_KEY = 'unfazed_client_token'

const clientApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

clientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLIENT_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

clientApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const isAuthCall = url.includes('/client-auth/')
    if (err.response?.status === 401 && !isAuthCall) window.dispatchEvent(new Event('client:expired'))
    return Promise.reject(err)
  },
)

export default clientApi
