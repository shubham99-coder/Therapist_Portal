import { useState } from 'react'

// ── Sidebar ──────────────────────────────────────────────────────────────────

const navItems = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2.5" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 6.5h14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 8.5c1.5.5 3 1.8 3 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h7.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0114 5.414V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L6 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 10.5h3M10 10.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.05 3.05l1.414 1.414M11.536 11.536l1.414 1.414M3.05 12.95l1.414-1.414M11.536 4.464l1.414-1.414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function Sidebar({ active, onNavigate }) {
  return (
    <aside
      className="flex flex-col"
      style={{ width: 220, background: '#0b1519', borderRight: '1px solid #1c2d33', minHeight: '100vh' }}
    >
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1c2d33' }}>
        <div className="flex items-center gap-2.5">
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2d8f6a 0%, #1a6b50 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5.8 2 4 3.8 4 6c0 1.5.8 2.8 2 3.5V11h4V9.5C11.2 8.8 12 7.5 12 6c0-2.2-1.8-4-4-4z" fill="white" opacity="0.9"/>
              <path d="M6 11h4v1.5a1 1 0 01-1 1H7a1 1 0 01-1-1V11z" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 17, color: '#e2ebe8', letterSpacing: '-0.01em' }}>Unfazed</div>
            <div style={{ fontSize: 10, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>unfazed.in/dr-sharma</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 10px', marginBottom: 2, borderRadius: 7, border: 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 500,
                background: isActive ? 'rgba(45,143,106,0.18)' : 'transparent',
                color: isActive ? '#7ecfae' : '#5c8a78',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: isActive ? '#7ecfae' : '#3d6e5c' }}>{item.icon}</span>
              {item.label}
              {isActive && <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#7ecfae' }} />}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: 12, margin: '0 10px 16px', borderRadius: 8, background: 'rgba(45,143,106,0.1)', border: '1px solid rgba(45,143,106,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: '#7ecfae', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>PRO PLAN</span>
          <span style={{ fontSize: 10, color: '#4a7a68', fontFamily: "'DM Mono', monospace" }}>&#8377;2,499/mo</span>
        </div>
        <div style={{ fontSize: 11, color: '#5c8a78', marginBottom: 8 }}>18 / 25 active clients</div>
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ height: '100%', width: '72%', borderRadius: 2, background: '#2d8f6a' }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #1c2d33', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=48&h=48&fit=crop&auto=format" alt="Dr. Priya Sharma" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#c5ddd6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. Priya Sharma</div>
          <div style={{ fontSize: 11, color: '#4a7a68' }}>Psychotherapist</div>
        </div>
      </div>
    </aside>
  )
}

// ── Dashboard View ────────────────────────────────────────────────────────────

const upcomingSessions = [
  { time: '09:00', name: 'Arjun Mehta', type: 'Individual', duration: '60 min', status: 'confirmed' },
  { time: '11:00', name: 'Sunita & Raj Patel', type: 'Couples', duration: '90 min', status: 'confirmed' },
  { time: '14:30', name: 'Rahul Kapoor', type: 'Individual', duration: '45 min', status: 'pending' },
  { time: '16:00', name: 'Neha Singh', type: 'Individual', duration: '60 min', status: 'confirmed' },
]

const recentActivity = [
  { action: 'Invoice sent', detail: 'Arjun Mehta — ₹3,000', time: '2h ago', dot: '#7ecfae' },
  { action: 'Session completed', detail: 'Sunita Patel — Session 4/12', time: '4h ago', dot: '#7ecfae' },
  { action: 'New booking', detail: 'Kavya Reddy via branded link', time: '1d ago', dot: '#f0a96e' },
  { action: 'Note added', detail: 'Private note — Rahul Kapoor', time: '1d ago', dot: '#9ab8f0' },
  { action: 'Payment received', detail: '₹9,000 — 3-session package', time: '2d ago', dot: '#7ecfae' },
]

function StatCard({ label, value, sub, trend }) {
  return (
    <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, padding: '20px 24px' }}>
      <div style={{ fontSize: 10, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 32, color: '#e2ebe8', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#5c8a78', marginTop: 6 }}>{sub}</div>}
      {trend && <div style={{ fontSize: 11, color: '#7ecfae', marginTop: 6, fontFamily: "'DM Mono', monospace" }}>{trend}</div>}
    </div>
  )
}

function DashboardView() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 6 }}>FRIDAY, 19 SEPTEMBER 2026</div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 30, color: '#e2ebe8', margin: 0, letterSpacing: '-0.02em' }}>Good morning, Dr. Sharma</h1>
        <p style={{ fontSize: 13, color: '#5c8a78', marginTop: 4 }}>You have 4 sessions today. Next: Arjun Mehta at 09:00.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="ACTIVE CLIENTS" value="18" sub="7 new this month" trend="+2 this week" />
        <StatCard label="SESSIONS (SEP)" value="47" sub="vs 41 last month" trend="up 14.6%" />
        <StatCard label="REVENUE (SEP)" value="&#8377;1.41L" sub="&#8377;94k collected" trend="&#8377;47k pending" />
        <StatCard label="NO-SHOW RATE" value="4.2%" sub="2 of 47 sessions" trend="down 1.1% vs aug" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1c2d33', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Today's Sessions</div>
            <span style={{ fontSize: 11, color: '#7ecfae', fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}>View all</span>
          </div>
          {upcomingSessions.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < upcomingSessions.length - 1 ? '1px solid #1c2d33' : 'none' }}>
              <div style={{ width: 52, textAlign: 'right' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#7ecfae', fontFamily: "'DM Mono', monospace" }}>{s.time}</span>
              </div>
              <div style={{ width: 3, height: 36, borderRadius: 2, background: s.status === 'confirmed' ? '#2d8f6a' : '#6b5c2d', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#4a7a68' }}>{s.type} · {s.duration}</div>
              </div>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20, fontFamily: "'DM Mono', monospace",
                background: s.status === 'confirmed' ? 'rgba(45,143,106,0.15)' : 'rgba(240,169,110,0.15)',
                color: s.status === 'confirmed' ? '#7ecfae' : '#f0a96e',
              }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #1c2d33' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Recent Activity</div>
          </div>
          {recentActivity.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 20px', alignItems: 'flex-start', borderBottom: i < recentActivity.length - 1 ? '1px solid #1c2d33' : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.dot, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#9cbfb5' }}>{a.action}</div>
                <div style={{ fontSize: 11, color: '#4a7a68', marginTop: 2 }}>{a.detail}</div>
              </div>
              <span style={{ fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap', marginTop: 2 }}>{a.time}</span>
            </div>
          ))}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #1c2d33' }}>
            <div style={{ fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', marginBottom: 8 }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['+ New session note', '+ Add client', '+ Send invoice'].map((action) => (
                <button key={action} style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1c2d33', borderRadius: 6, color: '#5c8a78', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Schedule View ─────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const sessionBlocks = [
  { day: 0, hour: 1, name: 'Arjun Mehta', color: '#2d8f6a' },
  { day: 0, hour: 3, name: 'Sunita & Raj Patel', color: '#9ab8f0' },
  { day: 1, hour: 2, name: 'Rahul Kapoor', color: '#2d8f6a' },
  { day: 2, hour: 0, name: 'Kavya Reddy', color: '#2d8f6a' },
  { day: 2, hour: 4, name: 'Group — Anxiety', color: '#c17ae8' },
  { day: 3, hour: 1, name: 'Meera Joshi', color: '#2d8f6a' },
  { day: 3, hour: 3, name: 'Vikram Shah', color: '#f0a96e' },
  { day: 4, hour: 2, name: 'Anita Desai', color: '#2d8f6a' },
  { day: 4, hour: 5, name: 'Arjun Mehta', color: '#2d8f6a' },
]

function ScheduleView() {
  const [selectedDay, setSelectedDay] = useState(4)
  const CELL_H = 56

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 4 }}>WEEK OF 14 – 20 SEPTEMBER 2026</div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: '#e2ebe8', margin: 0 }}>Schedule</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#2d8f6a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Block time
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
          <button
            key={d}
            onClick={() => setSelectedDay(i)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              borderColor: selectedDay === i ? '#2d8f6a' : '#1c2d33',
              background: selectedDay === i ? 'rgba(45,143,106,0.15)' : 'transparent',
              color: selectedDay === i ? '#7ecfae' : '#4a7a68',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(6, 1fr)', borderBottom: '1px solid #1c2d33' }}>
          <div style={{ padding: '12px 0', borderRight: '1px solid #1c2d33' }} />
          {DAYS.map((d, i) => (
            <div key={d} style={{ padding: '12px 0', textAlign: 'center', borderRight: i < DAYS.length - 1 ? '1px solid #1c2d33' : 'none', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', color: selectedDay === i ? '#7ecfae' : '#4a7a68' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          {HOURS.map((h, hi) => (
            <div key={h} style={{ display: 'grid', gridTemplateColumns: '64px repeat(6, 1fr)', borderBottom: hi < HOURS.length - 1 ? '1px solid #1c2d33' : 'none', height: CELL_H }}>
              <div style={{ padding: '6px 12px', borderRight: '1px solid #1c2d33', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace" }}>{h}</span>
              </div>
              {DAYS.map((_, di) => (
                <div key={di} style={{ borderRight: di < DAYS.length - 1 ? '1px solid #1c2d33' : 'none', background: selectedDay === di ? 'rgba(45,143,106,0.03)' : 'transparent' }} />
              ))}
            </div>
          ))}

          {sessionBlocks.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: s.hour * CELL_H + 2,
                left: `calc(64px + ${s.day} * (100% - 64px) / 6 + 4px)`,
                width: `calc((100% - 64px) / 6 - 8px)`,
                height: CELL_H - 4,
                background: s.color + '22',
                border: `1px solid ${s.color}55`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: 5,
                padding: '6px 8px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c5ddd6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
              <div style={{ fontSize: 10, color: '#5c8a78', fontFamily: "'DM Mono', monospace" }}>60 min</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Clients View ──────────────────────────────────────────────────────────────

const clients = [
  { id: 1, name: 'Arjun Mehta', age: 29, since: 'Mar 2026', sessions: 18, status: 'active', concern: 'Anxiety & work stress', nextSession: 'Today, 09:00', balance: 0 },
  { id: 2, name: 'Sunita Patel', age: 44, since: 'Jan 2026', sessions: 24, status: 'active', concern: 'Couples counselling', nextSession: 'Today, 11:00', balance: 3000 },
  { id: 3, name: 'Rahul Kapoor', age: 35, since: 'Jun 2026', sessions: 9, status: 'active', concern: 'Depression, OCD', nextSession: 'Today, 14:30', balance: 6000 },
  { id: 4, name: 'Neha Singh', age: 27, since: 'Jul 2026', sessions: 6, status: 'active', concern: 'Grief & loss', nextSession: 'Today, 16:00', balance: 0 },
  { id: 5, name: 'Kavya Reddy', age: 31, since: 'Sep 2026', sessions: 2, status: 'intake', concern: 'Social anxiety', nextSession: 'Mon, 08:00', balance: 3000 },
  { id: 6, name: 'Meera Joshi', age: 52, since: 'Feb 2026', sessions: 31, status: 'active', concern: 'Life transitions', nextSession: 'Thu, 09:00', balance: 0 },
  { id: 7, name: 'Vikram Shah', age: 40, since: 'Apr 2026', sessions: 14, status: 'on-hold', concern: 'PTSD', nextSession: '—', balance: 0 },
  { id: 8, name: 'Anita Desai', age: 38, since: 'Aug 2026', sessions: 4, status: 'active', concern: 'Burnout', nextSession: 'Fri, 14:00', balance: 0 },
]

const statusColors = {
  active: { bg: 'rgba(45,143,106,0.15)', text: '#7ecfae' },
  intake: { bg: 'rgba(240,169,110,0.15)', text: '#f0a96e' },
  'on-hold': { bg: 'rgba(255,255,255,0.06)', text: '#5c8a78' },
}

function ClientsView() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState(null)

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 4 }}>18 CLIENTS</div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: '#e2ebe8', margin: 0 }}>Client CRM</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#2d8f6a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Add client
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: 320, position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a7a68' }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            style={{ width: '100%', padding: '9px 12px 9px 34px', background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 8, color: '#c5ddd6', fontSize: 13, outline: 'none' }}
          />
        </div>
        {['all', 'active', 'intake', 'on-hold'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid',
              borderColor: filter === f ? '#2d8f6a' : '#1c2d33',
              background: filter === f ? 'rgba(45,143,106,0.15)' : 'transparent',
              color: filter === f ? '#7ecfae' : '#4a7a68',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1fr 340px' : '1fr', gap: 20 }}>
        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c2d33' }}>
                {['Client', 'Status', 'Sessions', 'Presenting concern', 'Next session', 'Balance'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', fontWeight: 500 }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #1c2d33' : 'none',
                    background: selectedClient?.id === c.id ? 'rgba(45,143,106,0.08)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#4a7a68' }}>Age {c.age} · since {c.since}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontFamily: "'DM Mono', monospace", background: statusColors[c.status].bg, color: statusColors[c.status].text }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#9cbfb5', fontFamily: "'DM Mono', monospace" }}>{c.sessions}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#5c8a78', maxWidth: 200 }}>{c.concern}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#9cbfb5', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>{c.nextSession}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: "'DM Mono', monospace", color: c.balance > 0 ? '#f0a96e' : '#5c8a78' }}>
                    {c.balance > 0 ? `₹${c.balance.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedClient && (
          <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #1c2d33', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: '#e2ebe8' }}>{selectedClient.name}</div>
                <div style={{ fontSize: 11, color: '#4a7a68', marginTop: 2 }}>{selectedClient.concern}</div>
              </div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', color: '#4a7a68', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {[
                { label: 'STATUS', value: selectedClient.status },
                { label: 'AGE', value: String(selectedClient.age) },
                { label: 'CLIENT SINCE', value: selectedClient.since },
                { label: 'TOTAL SESSIONS', value: String(selectedClient.sessions) },
                { label: 'NEXT SESSION', value: selectedClient.nextSession },
                { label: 'OUTSTANDING', value: selectedClient.balance > 0 ? `₹${selectedClient.balance.toLocaleString()}` : 'Nil' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1c2d33' }}>
                  <span style={{ fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: '#9cbfb5' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['View session history', 'Add session note', 'Send invoice', 'View intake form'].map((action) => (
                  <button key={action} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1c2d33', borderRadius: 7, color: '#5c8a78', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                    {action} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Notes View ────────────────────────────────────────────────────────────────

const noteList = [
  { id: 1, client: 'Arjun Mehta', date: '18 Sep 2026', type: 'private', preview: 'Session 18. Discussed workplace dynamics and cognitive reframing. Client showed significant progress...' },
  { id: 2, client: 'Sunita Patel', date: '18 Sep 2026', type: 'shared', preview: 'Summary of couples session. Communication exercises assigned. Both partners committed to daily check-ins.' },
  { id: 3, client: 'Rahul Kapoor', date: '17 Sep 2026', type: 'private', preview: 'OCD symptoms reduced from 7/10 to 4/10 on subjective scale. ERP exercises continuing well.' },
  { id: 4, client: 'Meera Joshi', date: '15 Sep 2026', type: 'private', preview: 'Explored grief related to career transition. Normalizing feelings of loss while holding space for growth.' },
  { id: 5, client: 'Kavya Reddy', date: '14 Sep 2026', type: 'shared', preview: 'Intake note. Presenting concern: social anxiety since college. Avoidance behaviours documented.' },
]

function NotesView() {
  const [selectedNote, setSelectedNote] = useState(noteList[0])
  const [noteContent, setNoteContent] = useState('Session 18. Client Arjun Mehta arrived 5 minutes early — positive sign of engagement.\n\nDiscussed workplace dynamics and cognitive reframing. The pattern of catastrophising before Monday meetings was explored in depth. Client identified the thought "I will definitely fail this presentation" and we worked through cognitive defusion techniques.\n\nHomework: Complete thought record for at least one anxiety-provoking situation before next session.\n\nOverall mood: 6/10 at start, 8/10 at end. Good session.')
  const [noteType, setNoteType] = useState('private')

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 4 }}>SESSION DOCUMENTATION</div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: '#e2ebe8', margin: 0 }}>Clinical Notes</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 200px)' }}>
        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1c2d33', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#c5ddd6' }}>Recent notes</span>
            <button style={{ width: 26, height: 26, borderRadius: 6, background: '#2d8f6a', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {noteList.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                style={{ padding: '14px 16px', borderBottom: '1px solid #1c2d33', cursor: 'pointer', background: selectedNote.id === note.id ? 'rgba(45,143,106,0.1)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#c5ddd6' }}>{note.client}</span>
                  <span style={{
                    fontSize: 9, padding: '2px 6px', borderRadius: 20, fontFamily: "'DM Mono', monospace",
                    background: note.type === 'private' ? 'rgba(193,122,232,0.15)' : 'rgba(45,143,106,0.15)',
                    color: note.type === 'private' ? '#c17ae8' : '#7ecfae',
                  }}>
                    {note.type}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>{note.date}</div>
                <div style={{ fontSize: 11, color: '#4a7a68', lineHeight: 1.5 }}>{note.preview.substring(0, 80)}...</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1c2d33', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>{selectedNote.client}</div>
              <div style={{ fontSize: 11, color: '#4a7a68' }}>{selectedNote.date} · Session note</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['private', 'shared'].map((t) => (
                <button
                  key={t}
                  onClick={() => setNoteType(t)}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: '1px solid',
                    borderColor: noteType === t ? (t === 'private' ? '#c17ae8' : '#2d8f6a') : '#1c2d33',
                    background: noteType === t ? (t === 'private' ? 'rgba(193,122,232,0.15)' : 'rgba(45,143,106,0.15)') : 'transparent',
                    color: noteType === t ? (t === 'private' ? '#c17ae8' : '#7ecfae') : '#4a7a68',
                    fontSize: 11, cursor: 'pointer',
                  }}
                >
                  {t === 'private' ? '🔒 Private' : '👁 Shared'}
                </button>
              ))}
            </div>
            <button style={{ padding: '7px 14px', background: '#2d8f6a', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
          </div>

          {noteType === 'private' && (
            <div style={{ padding: '8px 20px', background: 'rgba(193,122,232,0.08)', borderBottom: '1px solid rgba(193,122,232,0.15)', fontSize: 11, color: '#c17ae8' }}>
              Private — this note is never visible to the client
            </div>
          )}

          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            style={{ flex: 1, padding: 24, background: 'transparent', border: 'none', outline: 'none', color: '#c5ddd6', fontSize: 14, lineHeight: 1.8, resize: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
            placeholder="Start writing your session note..."
          />

          <div style={{ padding: '10px 20px', borderTop: '1px solid #1c2d33', display: 'flex', gap: 8 }}>
            {['SOAP Template', 'DAP Template', 'Progress Note'].map((tmpl) => (
              <button key={tmpl} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1c2d33', borderRadius: 6, color: '#4a7a68', fontSize: 11, cursor: 'pointer' }}>
                {tmpl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Analytics View ────────────────────────────────────────────────────────────

const revenueData = [
  { month: 'Apr', revenue: 82000 },
  { month: 'May', revenue: 97000 },
  { month: 'Jun', revenue: 110000 },
  { month: 'Jul', revenue: 105000 },
  { month: 'Aug', revenue: 124000 },
  { month: 'Sep', revenue: 141000 },
]
const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))

function AnalyticsView() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 4 }}>APR – SEP 2026</div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: '#e2ebe8', margin: 0 }}>Practice Analytics</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL REVENUE (6M)', value: '₹6.59L', sub: '6-month cumulative' },
          { label: 'AVG SESSIONS/MONTH', value: '41.5', sub: 'trending up' },
          { label: 'CLIENT RETENTION', value: '87%', sub: 'after session 4' },
          { label: 'LIFETIME VALUE', value: '₹38,200', sub: 'avg per client' },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, color: '#e2ebe8' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: '#5c8a78', marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6', marginBottom: 4 }}>Monthly Revenue</div>
        <div style={{ fontSize: 11, color: '#4a7a68', marginBottom: 24 }}>Billed per month, April – September 2026</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 180 }}>
          {revenueData.map((d) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#5c8a78', fontFamily: "'DM Mono', monospace" }}>
                {(d.revenue / 1000).toFixed(0)}k
              </span>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                background: d.month === 'Sep' ? '#2d8f6a' : 'rgba(45,143,106,0.3)',
                height: `${(d.revenue / maxRevenue) * 140}px`,
              }} />
              <span style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace" }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6', marginBottom: 16 }}>Session Types (Sep)</div>
          {[
            { label: 'Individual (60 min)', count: 34, pct: 72 },
            { label: 'Individual (90 min)', count: 8, pct: 17 },
            { label: 'Couples', count: 4, pct: 9 },
            { label: 'Group', count: 1, pct: 2 },
          ].map((row) => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#9cbfb5' }}>{row.label}</span>
                <span style={{ fontSize: 11, color: '#5c8a78', fontFamily: "'DM Mono', monospace" }}>{row.count} ({row.pct}%)</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', width: `${row.pct}%`, borderRadius: 2, background: '#2d8f6a' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6', marginBottom: 16 }}>Attendance (Sep)</div>
          {[
            { label: 'Completed', value: 43, color: '#2d8f6a' },
            { label: 'Cancelled (24h+ notice)', value: 2, color: '#9ab8f0' },
            { label: 'No-show', value: 2, color: '#f0a96e' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: '#9cbfb5' }}>{row.label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600, color: '#c5ddd6' }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 4, padding: 14, background: 'rgba(240,169,110,0.08)', border: '1px solid rgba(240,169,110,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#f0a96e', marginBottom: 2 }}>No-show rate: 4.2%</div>
            <div style={{ fontSize: 11, color: '#5c8a78' }}>Recommend enabling 24h SMS reminders</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Billing View ──────────────────────────────────────────────────────────────

const invoices = [
  { id: 'INV-047', client: 'Arjun Mehta', amount: 3000, date: '18 Sep', status: 'paid', type: 'Per session' },
  { id: 'INV-046', client: 'Sunita Patel', amount: 9000, date: '17 Sep', status: 'pending', type: '3-session pkg' },
  { id: 'INV-045', client: 'Rahul Kapoor', amount: 15000, date: '15 Sep', status: 'pending', type: '6-session pkg' },
  { id: 'INV-044', client: 'Kavya Reddy', amount: 3000, date: '14 Sep', status: 'paid', type: 'Per session' },
  { id: 'INV-043', client: 'Meera Joshi', amount: 3000, date: '12 Sep', status: 'paid', type: 'Per session' },
  { id: 'INV-042', client: 'Anita Desai', amount: 3000, date: '10 Sep', status: 'overdue', type: 'Per session' },
]

const invStatus = {
  paid: { bg: 'rgba(45,143,106,0.15)', text: '#7ecfae' },
  pending: { bg: 'rgba(240,169,110,0.15)', text: '#f0a96e' },
  overdue: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
}

function BillingView() {
  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 4 }}>PAYMENTS & PACKAGES</div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: '#e2ebe8', margin: 0 }}>Billing</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#2d8f6a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + New invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'COLLECTED (SEP)', value: '₹94,000', sub: 'from 31 invoices', warn: false, danger: false },
          { label: 'PENDING', value: '₹24,000', sub: '2 invoices awaiting payment', warn: true, danger: false },
          { label: 'OVERDUE', value: '₹3,000', sub: '1 invoice > 30 days', warn: false, danger: true },
        ].map((s) => (
          <div key={s.label} style={{ background: '#0e1f25', border: `1px solid ${s.danger ? 'rgba(239,68,68,0.2)' : s.warn ? 'rgba(240,169,110,0.2)' : '#1c2d33'}`, borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, color: s.danger ? '#f87171' : s.warn ? '#f0a96e' : '#e2ebe8' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#5c8a78', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#c5ddd6', marginBottom: 14, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>SESSION PACKAGES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { sessions: 3, rate: 3000, total: 9000, label: 'Starter', popular: false },
            { sessions: 6, rate: 2800, total: 16800, label: 'Regular', popular: true },
            { sessions: 12, rate: 2600, total: 31200, label: 'Deep Work', popular: false },
          ].map((pkg) => (
            <div key={pkg.sessions} style={{ background: pkg.popular ? 'rgba(45,143,106,0.12)' : '#0e1f25', border: `1px solid ${pkg.popular ? '#2d8f6a' : '#1c2d33'}`, borderRadius: 10, padding: '16px 20px', position: 'relative' }}>
              {pkg.popular && (
                <span style={{ position: 'absolute', top: -1, right: 16, transform: 'translateY(-50%)', background: '#2d8f6a', color: '#fff', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>POPULAR</span>
              )}
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: '#e2ebe8', marginBottom: 4 }}>{pkg.sessions} sessions</div>
              <div style={{ fontSize: 11, color: '#4a7a68', marginBottom: 10 }}>{pkg.label} · ₹{pkg.rate.toLocaleString()}/session</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#7ecfae', fontFamily: "'DM Mono', monospace" }}>₹{pkg.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1c2d33', fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Recent Invoices</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1c2d33' }}>
              {['Invoice', 'Client', 'Type', 'Amount', 'Date', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#334d43', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? '1px solid #1c2d33' : 'none' }}>
                <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#5c8a78' }}>{inv.id}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#c5ddd6' }}>{inv.client}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#5c8a78' }}>{inv.type}</td>
                <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#9cbfb5' }}>₹{inv.amount.toLocaleString()}</td>
                <td style={{ padding: '12px 16px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#5c8a78' }}>{inv.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontFamily: "'DM Mono', monospace", background: invStatus[inv.status].bg, color: invStatus[inv.status].text }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button style={{ fontSize: 11, color: '#4a7a68', background: 'none', border: '1px solid #1c2d33', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Settings View ─────────────────────────────────────────────────────────────

function SettingsView() {
  const [slug, setSlug] = useState('dr-sharma')
  const [bio, setBio] = useState('Registered psychotherapist with 8+ years of experience working with adults on anxiety, depression, and life transitions. CBT and ACT-trained.')
  const [specializations, setSpecializations] = useState(['Anxiety', 'Depression', 'Couples', 'Trauma'])
  const [sessionDuration, setSessionDuration] = useState('60')

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800, width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', marginBottom: 4 }}>PRACTICE SETTINGS</div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: '#e2ebe8', margin: 0 }}>Settings</h1>
      </div>

      <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1c2d33', fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Public Profile</div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&auto=format" alt="Profile" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Dr. Priya Sharma</div>
              <button style={{ fontSize: 11, color: '#7ecfae', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>Change photo</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 6 }}>BRANDED LINK</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0b1519', border: '1px solid #1c2d33', borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '10px 12px', fontSize: 13, color: '#334d43', borderRight: '1px solid #1c2d33', whiteSpace: 'nowrap' }}>unfazed.in/</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} style={{ flex: 1, padding: '10px 12px', background: 'transparent', border: 'none', color: '#c5ddd6', fontSize: 13, outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 6 }}>BIO</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ width: '100%', padding: '10px 12px', background: '#0b1519', border: '1px solid #1c2d33', borderRadius: 8, color: '#c5ddd6', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 8 }}>SPECIALIZATIONS</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {specializations.map((s) => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(45,143,106,0.15)', border: '1px solid rgba(45,143,106,0.25)', borderRadius: 20, fontSize: 12, color: '#7ecfae' }}>
                  {s}
                  <button onClick={() => setSpecializations(specializations.filter((x) => x !== s))} style={{ background: 'none', border: 'none', color: '#4a7a68', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>x</button>
                </span>
              ))}
              <button style={{ padding: '5px 10px', background: 'transparent', border: '1px dashed #2d8f6a', borderRadius: 20, fontSize: 12, color: '#4a7a68', cursor: 'pointer' }}>+ Add</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#0e1f25', border: '1px solid #1c2d33', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1c2d33', fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Availability</div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 8 }}>DEFAULT SESSION DURATION</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['30', '45', '60', '90'].map((d) => (
                <button key={d} onClick={() => setSessionDuration(d)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid', borderColor: sessionDuration === d ? '#2d8f6a' : '#1c2d33', background: sessionDuration === d ? 'rgba(45,143,106,0.15)' : 'transparent', color: sessionDuration === d ? '#7ecfae' : '#4a7a68', fontSize: 13, cursor: 'pointer' }}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#4a7a68', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 8 }}>WORKING DAYS</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <button key={day} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid', borderColor: i < 5 ? '#2d8f6a' : '#1c2d33', background: i < 5 ? 'rgba(45,143,106,0.15)' : 'transparent', color: i < 5 ? '#7ecfae' : '#334d43', fontSize: 12, cursor: 'pointer' }}>
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#0e1f25', border: '1px solid rgba(45,143,106,0.3)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1c2d33', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c5ddd6' }}>Subscription</div>
          <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(45,143,106,0.2)', color: '#7ecfae', borderRadius: 20, fontFamily: "'DM Mono', monospace" }}>PRO ACTIVE</span>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { tier: 'Starter', price: '₹999', clients: '10 clients', features: ['Profile page', 'Basic scheduling', 'Manual billing'], active: false },
            { tier: 'Pro', price: '₹2,499', clients: '25 clients', features: ['Everything in Starter', 'Razorpay payments', 'Clinical notes', 'Analytics'], active: true },
            { tier: 'Practice', price: '₹5,999', clients: 'Unlimited', features: ['Everything in Pro', 'Multi-therapist', 'API access', 'Priority support'], active: false },
          ].map((plan) => (
            <div key={plan.tier} style={{ padding: 16, borderRadius: 8, border: '1px solid', borderColor: plan.active ? '#2d8f6a' : '#1c2d33', background: plan.active ? 'rgba(45,143,106,0.08)' : 'transparent' }}>
              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: '#e2ebe8', marginBottom: 4 }}>{plan.tier}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: plan.active ? '#7ecfae' : '#9cbfb5', marginBottom: 4 }}>{plan.price}<span style={{ fontSize: 11, color: '#5c8a78' }}>/mo</span></div>
              <div style={{ fontSize: 11, color: '#4a7a68', marginBottom: 10 }}>{plan.clients}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5c8a78' }}>
                    <span style={{ color: plan.active ? '#7ecfae' : '#334d43' }}>v</span> {f}
                  </div>
                ))}
              </div>
              {!plan.active && (
                <button style={{ marginTop: 12, width: '100%', padding: '7px', background: 'transparent', border: '1px solid #2d8f6a', borderRadius: 7, color: '#7ecfae', fontSize: 12, cursor: 'pointer' }}>
                  Switch plan
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{ padding: '10px 24px', background: '#2d8f6a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Save changes
        </button>
      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ view }) {
  const labels = {
    dashboard: 'Overview', schedule: 'Schedule', clients: 'Client CRM',
    notes: 'Clinical Notes', analytics: 'Analytics', billing: 'Billing', settings: 'Settings',
  }
  return (
    <header style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', borderBottom: '1px solid #1c2d33', background: '#0b1519', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ fontSize: 12, color: '#4a7a68', fontFamily: "'DM Mono', monospace" }}>
        unfazed / <span style={{ color: '#7ecfae' }}>{labels[view]}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{ position: 'relative', width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1c2d33', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1a4 4 0 014 4v2.5l1.5 2H1.5L3 7.5V5a4 4 0 014-4z" stroke="#5c8a78" strokeWidth="1.5"/>
            <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="#5c8a78" strokeWidth="1.5"/>
          </svg>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#f0a96e', border: '1.5px solid #0b1519' }} />
        </button>
        <button style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1c2d33', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5c8a78', fontSize: 13, fontWeight: 600 }}>?</button>
      </div>
    </header>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('dashboard')

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <DashboardView />
      case 'schedule': return <ScheduleView />
      case 'clients': return <ClientsView />
      case 'notes': return <NotesView />
      case 'analytics': return <AnalyticsView />
      case 'billing': return <BillingView />
      case 'settings': return <SettingsView />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0e1a1f' }}>
      <Sidebar active={view} onNavigate={setView} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header view={view} />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderView()}
        </main>
      </div>
    </div>
  )
}