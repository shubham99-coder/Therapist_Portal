import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { publicLink } from '../../utils/format'
import NotificationBell from '../notifications/NotificationBell'
import { C, S, font } from './theme'

const labels = {
  '/dashboard': 'Overview',
  '/dashboard/schedule': 'Schedule',
  '/dashboard/clients': 'Client CRM',
  '/dashboard/notes': 'Clinical Notes',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
  '/dashboard/chat': 'Chat',
  '/dashboard/notifications': 'Notifications',
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { therapist, logout } = useAuth()
  const toast = useToast()

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink(therapist.slug))
      toast.success('Branded link copied')
    } catch {
      toast.error('Could not copy. Copy it from the address bar instead.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', borderBottom: `1px solid ${C.line}`, background: C.side }}>
      <div style={{ fontSize: 12, color: C.dim, fontFamily: font.mono }}>
        unfazed / <span style={{ color: C.mint }}>{labels[pathname] || 'Overview'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={copyLink} style={{ ...S.btnGhost, fontFamily: font.mono, fontSize: 11 }}>Copy my link</button>
        <a href={`/${therapist?.slug}`} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, textDecoration: 'none', fontSize: 11 }}>View public page</a>
        <NotificationBell userId={therapist?._id || therapist?.id} />
        <button onClick={handleLogout} style={{ ...S.btnGhost, fontSize: 11 }}>Log out</button>
      </div>
    </header>
  )
}
