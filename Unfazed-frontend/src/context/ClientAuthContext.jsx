import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import clientApi, { CLIENT_TOKEN_KEY } from '../api/clientAxios'

const ClientAuthContext = createContext(null)

export function ClientAuthProvider({ children }) {
  const [client, setClient] = useState(null)
  const [therapist, setTherapist] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem(CLIENT_TOKEN_KEY))

  const clearSession = useCallback(() => {
    localStorage.removeItem(CLIENT_TOKEN_KEY)
    setClient(null)
    setTherapist(null)
  }, [])

  const refresh = useCallback(async () => {
    const { data } = await clientApi.get('/client-auth/me')
    setClient(data.client)
    setTherapist(data.therapist)
    return data
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(CLIENT_TOKEN_KEY)) return
    refresh().catch(clearSession).finally(() => setLoading(false))
  }, [refresh, clearSession])

  useEffect(() => {
    window.addEventListener('client:expired', clearSession)
    return () => window.removeEventListener('client:expired', clearSession)
  }, [clearSession])

  const startSession = async (token) => {
    localStorage.setItem(CLIENT_TOKEN_KEY, token)
    return refresh()
  }

  const login = async (email, password) => {
    const { data } = await clientApi.post('/client-auth/login', { email, password })
    return startSession(data.token)
  }

  const register = async (payload) => {
    const { data } = await clientApi.post('/client-auth/register', payload)
    return startSession(data.token)
  }

  const value = { client, therapist, loading, isAuthenticated: !!client, login, register, logout: clearSession, refresh }
  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useClientAuth = () => useContext(ClientAuthContext)
