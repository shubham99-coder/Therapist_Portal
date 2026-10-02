import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useClientAuth } from '../../context/ClientAuthContext'
import { C, font } from '../../components/common/theme'

const links = [
  ['/client/portal', 'Overview'],
  ['/client/portal/book', 'Book a session'],
  ['/client/portal/sessions', 'Sessions'],
  ['/client/portal/payments', 'Payments'],
  ['/client/portal/chat', 'Chat'],
  ['/client/portal/notes', 'Shared notes'],
  ['/client/portal/intake', 'Intake'],
  ['/client/portal/notifications', 'Notifications'],
  ['/client/portal/profile', 'Profile'],
]

export default function ClientPortal() {
  const { client, therapist, logout } = useClientAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/client/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex' }}>
      <aside style={{ width: 230, flexShrink: 0, borderRight: `1px solid ${C.line}`, background: C.side, padding: 18, display: 'flex', flexDirection: 'column' }}>
        <Link to="/client/portal" style={{ color: C.text, textDecoration: 'none', fontFamily: font.serif, fontSize: 23 }}>unfazed</Link>
        <div style={{ marginTop: 4, color: C.dim, fontFamily: font.mono, fontSize: 8 }}>CLIENT PORTAL</div>

        <div style={{ marginTop: 28, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{client?.name || 'Client'}</div>
          <div style={{ marginTop: 3, color: C.dim, fontSize: 9 }}>{therapist?.name || 'Therapist'}</div>
        </div>

        <nav style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(([to, label]) => {
            const active = to === '/client/portal' ? location.pathname === to : location.pathname.startsWith(to)
            return <Link key={to} to={to} style={{ padding: '9px 10px', borderRadius: 7, background: active ? 'rgba(45,143,106,0.14)' : 'transparent', color: active ? C.mint : C.text2, textDecoration: 'none', fontSize: 11 }}>{label}</Link>
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {therapist?.slug && <Link to={`/${therapist.slug}`} style={{ color: C.dim, textDecoration: 'none', fontSize: 10 }}>View therapist page</Link>}
          <button type="button" onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${C.line}`, color: C.muted, borderRadius: 7, padding: '8px 10px', cursor: 'pointer', textAlign: 'left', fontSize: 10 }}>Log out</button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: 28, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
