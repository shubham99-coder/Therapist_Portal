import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { upcomingSessions, recentActivity } from '../../data/mock'
import { Badge, StatCard } from '../../components/common/ui'
import { C, S, font } from '../../components/common/theme'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const { therapist } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [sessions, setSessions] = useState(upcomingSessions)

  const confirmSession = (id) => {
    setSessions((list) => list.map((s) => (s.id === id ? { ...s, status: 'confirmed' } : s)))
    toast.success('Session confirmed')
  }

  const quickActions = [
    { label: '+ New session note', run: () => navigate('/dashboard/notes', { state: { newNote: true } }) },
    { label: '+ Add client', run: () => navigate('/dashboard/clients', { state: { openAdd: true } }) },
    { label: '+ Send invoice', run: () => navigate('/dashboard/billing', { state: { openNew: true } }) },
  ]

  const next = sessions[0]

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...S.eyebrow, marginBottom: 6 }}>{format(new Date(), 'EEEE, d MMMM yyyy').toUpperCase()}</div>
        <h1 style={{ ...S.h1, fontSize: 30 }}>{greeting()}, {therapist?.name}</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          You have {sessions.length} sessions today.{next ? ` Next: ${next.name} at ${next.time}.` : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="ACTIVE CLIENTS" value="18" sub="7 new this month" trend="+2 this week" />
        <StatCard label="SESSIONS (SEP)" value="47" sub="vs 41 last month" trend="up 14.6%" />
        <StatCard label="REVENUE (SEP)" value="₹1.41L" sub="₹94k collected" trend="₹47k pending" />
        <StatCard label="NO-SHOW RATE" value="4.2%" sub="2 of 47 sessions" trend="down 1.1% vs Aug" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>Today's sessions</div>
            <button onClick={() => navigate('/dashboard/schedule')} style={{ fontSize: 11, color: C.mint, fontFamily: font.mono, background: 'none', border: 'none', cursor: 'pointer' }}>View schedule</button>
          </div>
          {sessions.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < sessions.length - 1 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 52, textAlign: 'right' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.mint, fontFamily: font.mono }}>{s.time}</span>
              </div>
              <div style={{ width: 3, height: 36, borderRadius: 2, background: s.status === 'confirmed' ? C.green : '#6b5c2d', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{s.type} · {s.duration}</div>
              </div>
              {s.status === 'pending' && (
                <button onClick={() => confirmSession(s.id)} style={{ ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}>Confirm</button>
              )}
              <Badge bg={s.status === 'confirmed' ? 'rgba(45,143,106,0.15)' : 'rgba(240,169,110,0.15)'} color={s.status === 'confirmed' ? C.mint : C.amber}>{s.status}</Badge>
            </div>
          ))}
        </div>

        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.line}`, fontSize: 13, fontWeight: 600, color: C.text2 }}>Recent activity</div>
          {recentActivity.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 20px', alignItems: 'flex-start', borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.dot, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text3 }}>{a.action}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{a.detail}</div>
              </div>
              <span style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, whiteSpace: 'nowrap', marginTop: 2 }}>{a.time}</span>
            </div>
          ))}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em', marginBottom: 8 }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {quickActions.map((a) => (
                <button key={a.label} onClick={a.run} style={{ ...S.btnGhost, width: '100%' }}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
