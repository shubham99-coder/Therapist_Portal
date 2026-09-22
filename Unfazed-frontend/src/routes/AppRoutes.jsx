import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/common/ui'
import DashboardLayout from '../components/common/DashboardLayout'
import AuthPage from '../pages/auth/AuthPage'
import PublicProfile from '../pages/client/PublicProfile'
import Dashboard from '../pages/therapist/Dashboard'
import Schedule from '../pages/therapist/Schedule'
import Clients from '../pages/therapist/Clients'
import Notes from '../pages/therapist/Notes'
import Analytics from '../pages/therapist/Analytics'
import Billing from '../pages/therapist/Billing'
import Settings from '../pages/therapist/Settings'
import NotFound from '../pages/client/NotFound'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner label="Loading your practice" />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner />
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function Home() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner />
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><AuthPage key="login" mode="login" /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthPage key="signup" mode="signup" /></GuestRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="clients" element={<Clients />} />
        <Route path="notes" element={<Notes />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Static routes above win over this dynamic one */}
      <Route path="/:slug" element={<PublicProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
