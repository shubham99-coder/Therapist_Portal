import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/common/ui'
import DashboardLayout from '../components/common/DashboardLayout'
import AuthPage from '../pages/auth/AuthPage'
import PublicProfile from '../pages/client/PublicProfile'
import IntakeForm from '../pages/client/IntakeForm'
import ClientNotes from '../pages/client/ClientNotes'
import ClientPortal from '../pages/client/ClientPortal'
import ClientOverview from '../pages/client/ClientOverview'
import ClientBookingPage from '../pages/client/ClientBookingPage'
import ClientSessions from '../pages/client/ClientSessions'
import ClientPayments from '../pages/client/ClientPayments'
import ClientChat from '../pages/client/ClientChat'
import ClientNotesPortal from '../pages/client/ClientNotesPortal'
import ClientIntakePortal from '../pages/client/ClientIntakePortal'
import ClientNotifications from '../pages/client/ClientNotifications'
import ClientProfile from '../pages/client/ClientProfile'
import { useClientAuth } from '../context/ClientAuthContext'
import Dashboard from '../pages/therapist/Dashboard'
import Schedule from '../pages/therapist/Schedule'
import Clients from '../pages/therapist/Clients'
import Notes from '../pages/therapist/Notes'
import Analytics from '../pages/therapist/Analytics'
import Billing from '../pages/therapist/Billing'
import Settings from '../pages/therapist/Settings'
import NotFound from '../pages/client/NotFound'
import Chat from '../pages/therapist/Chat'
import Notifications from '../pages/therapist/Notifications'

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


function ClientProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useClientAuth()
  if (loading) return <Spinner label="Loading your client portal" />
  return isAuthenticated ? children : <Navigate to="/client/login" replace />
}

function ClientGuestRoute({ children }) {
  const { isAuthenticated, loading } = useClientAuth()
  if (loading) return <Spinner />
  return isAuthenticated ? <Navigate to="/client/portal" replace /> : children
}

function Home() {
  const therapistAuth = useAuth()
  const clientAuth = useClientAuth()
  if (therapistAuth.loading || clientAuth.loading) return <Spinner />
  if (clientAuth.isAuthenticated) return <Navigate to="/client/portal" replace />
  return <Navigate to={therapistAuth.isAuthenticated ? '/dashboard' : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><AuthPage key="login" mode="login" /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthPage key="signup" mode="signup" /></GuestRoute>} />
      <Route path="/client/login" element={<ClientGuestRoute><AuthPage key="client-login" mode="login" role="client" /></ClientGuestRoute>} />
      <Route path="/client/register" element={<ClientGuestRoute><AuthPage key="client-register" mode="signup" role="client" /></ClientGuestRoute>} />

      <Route path="/client/portal" element={<ClientProtectedRoute><ClientPortal /></ClientProtectedRoute>}>
        <Route index element={<ClientOverview />} />
        <Route path="book" element={<ClientBookingPage />} />
        <Route path="sessions" element={<ClientSessions />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="chat" element={<ClientChat />} />
        <Route path="notes" element={<ClientNotesPortal />} />
        <Route path="intake" element={<ClientIntakePortal />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="profile" element={<ClientProfile />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="clients" element={<Clients />} />
        <Route path="notes" element={<Notes />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="billing" element={<Billing />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chat" element={<Chat />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Static routes above win over these dynamic ones; intake must come before the bare :slug route */}
      <Route path="/:slug/intake/:clientId" element={<IntakeForm />} />
      <Route path="/client/:clientId/notes" element={<ClientNotes />} />
      <Route path="/:slug" element={<PublicProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
