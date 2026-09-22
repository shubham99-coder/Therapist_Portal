import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { publicLink } from '../../utils/format'
import { C, S, font } from './theme'

const labels = {
  '/dashboard': 'Overview', '/dashboard/schedule': 'Schedule', '/dashboard/clients': 'Client CRM',
  '/dashboard/notes': 'Clinical Notes', '/dashboard/analytics': 'Analytics',
  '/dashboard/billing': 'Billing', '/dashboard/settings': 'Settings',
}

const iconBtn = { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, fontSize: 13, fontWeight: 600 }

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
        <button onClick={() => toast.info('Notifications arrive with Module 6')} aria-label="Notifications" style={{ ...iconBtn, position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a4 4 0 014 4v2.5l1.5 2H1.5L3 7.5V5a4 4 0 014-4z" stroke="#5c8a78" strokeWidth="1.5" />
            <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="#5c8a78" strokeWidth="1.5" />
          </svg>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: C.amber, border: `1.5px solid ${C.side}` }} />
        </button>
        <button onClick={handleLogout} style={{ ...S.btnGhost, fontSize: 11 }}>Log out</button>
      </div>
    </header>
  )
}
