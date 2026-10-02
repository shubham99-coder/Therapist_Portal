import { AuthProvider } from './context/AuthContext'
import { ClientAuthProvider } from './context/ClientAuthContext'
import { ToastProvider } from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ClientAuthProvider>
          <AppRoutes />
        </ClientAuthProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
