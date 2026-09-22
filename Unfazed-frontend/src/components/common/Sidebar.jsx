import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { C, font } from './theme'
import { initials } from '../../utils/format'

const icon = (children) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{children}</svg>
)
const s = { stroke: 'currentColor', strokeWidth: 1.5 }
const r = { ...s, strokeLinecap: 'round' }

const navItems = [
  { to: '/dashboard', label: 'Overview', end: true, icon: icon(<><rect x="1" y="1" width="6" height="6" rx="1" {...s} /><rect x="9" y="1" width="6" height="6" rx="1" {...s} /><rect x="1" y="9" width="6" height="6" rx="1" {...s} /><rect x="9" y="9" width="6" height="6" rx="1" {...s} /></>) },
  { to: '/dashboard/schedule', label: 'Schedule', icon: icon(<><rect x="1" y="2.5" width="14" height="12" rx="1.5" {...s} /><path d="M1 6.5h14" {...s} /><path d="M5 1v3M11 1v3" {...r} /></>) },
  { to: '/dashboard/clients', label: 'Clients', icon: icon(<><circle cx="6" cy="5" r="3" {...s} /><path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" {...r} /><path d="M11 8.5c1.5.5 3 1.8 3 3.5" {...r} /><circle cx="12" cy="5" r="2" {...s} /></>) },
  { to: '/dashboard/notes', label: 'Notes', icon: icon(<><path d="M3 2h7.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0114 5.414V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" {...s} /><path d="M10 2v4h4" {...r} /><path d="M5 8h6M5 11h4" {...r} /></>) },
  { to: '/dashboard/analytics', label: 'Analytics', icon: icon(<><path d="M2 12L6 7l3 3 5-6" {...r} strokeLinejoin="round" /><path d="M1 14.5h14" {...r} /></>) },
  { to: '/dashboard/billing', label: 'Billing', icon: icon(<><rect x="1" y="3" width="14" height="10" rx="1.5" {...s} /><path d="M1 7h14" {...s} /><path d="M4 10.5h3M10 10.5h2" {...r} /></>) },
  { to: '/dashboard/settings', label: 'Settings', icon: icon(<><circle cx="8" cy="8" r="2.5" {...s} /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.05 3.05l1.414 1.414M11.536 11.536l1.414 1.414M3.05 12.95l1.414-1.414M11.536 4.464l1.414-1.414" {...r} /></>) },
]

export default function Sidebar() {
  const { therapist } = useAuth()

  return (
    <aside style={{ width: 220, flexShrink: 0, background: C.side, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2d8f6a 0%, #1a6b50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5.8 2 4 3.8 4 6c0 1.5.8 2.8 2 3.5V11h4V9.5C11.2 8.8 12 7.5 12 6c0-2.2-1.8-4-4-4z" fill="white" opacity="0.9" />
              <path d="M6 11h4v1.5a1 1 0 01-1 1H7a1 1 0 01-1-1V11z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: font.serif, fontSize: 17, color: C.text, letterSpacing: '-0.01em' }}>Unfazed</div>
            <div style={{ fontSize: 10, color: C.dim, fontFamily: font.mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>unfazed.in/{therapist?.slug}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 10px', marginBottom: 2, borderRadius: 7, textDecoration: 'none',
              fontSize: 13, fontWeight: 500,
              background: isActive ? 'rgba(45,143,106,0.18)' : 'transparent',
              color: isActive ? C.mint : C.muted,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ color: isActive ? C.mint : '#3d6e5c', display: 'flex' }}>{item.icon}</span>
                {item.label}
                {isActive && <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: C.mint }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 12, margin: '0 10px 16px', borderRadius: 8, background: 'rgba(45,143,106,0.1)', border: '1px solid rgba(45,143,106,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.mint, fontFamily: font.mono, letterSpacing: '0.06em' }}>PRO PLAN</span>
          <span style={{ fontSize: 10, color: C.dim, fontFamily: font.mono }}>&#8377;2,499/mo</span>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>18 / 25 active clients</div>
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ height: '100%', width: '72%', borderRadius: 2, background: C.green }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        {therapist?.photoUrl ? (
          <img src={therapist.photoUrl} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(45,143,106,0.25)', color: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
            {initials(therapist?.name)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{therapist?.name}</div>
          <div style={{ fontSize: 11, color: C.dim }}>Therapist</div>
        </div>
      </div>
    </aside>
  )
}
