import { createContext, useCallback, useContext, useState } from 'react'
import { C } from '../components/common/theme'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  }

  const color = { success: C.mint, error: C.red, info: C.amber }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 100 }}>
        {toasts.map((t) => (
          <div key={t.id} role="status" style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${color[t.type]}`, borderRadius: 8, padding: '10px 16px', fontSize: 13, color: C.text2, maxWidth: 340, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
