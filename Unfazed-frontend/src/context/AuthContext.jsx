import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { TOKEN_KEY } from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [therapist, setTherapist] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY))

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setTherapist(null)
  }, [])

  const refresh = useCallback(async () => {
    const { data } = await api.get('/therapists/me')
    setTherapist(data)
    return data
  }, [])

  // Restore the session on first load
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    refresh().catch(clearSession).finally(() => setLoading(false))
  }, [refresh, clearSession])

  // Axios tells us when the token is no longer valid
  useEffect(() => {
    window.addEventListener('auth:expired', clearSession)
    return () => window.removeEventListener('auth:expired', clearSession)
  }, [clearSession])

  const startSession = async (token) => {
    localStorage.setItem(TOKEN_KEY, token)
    return refresh()
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return startSession(data.token)
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    return startSession(data.token)
  }

  const updateProfile = async (updates) => {
    const { data } = await api.put('/therapists/me', updates)
    setTherapist(data)
    return data
  }

  const value = { therapist, loading, isAuthenticated: !!therapist, login, register, logout: clearSession, updateProfile, refresh }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
