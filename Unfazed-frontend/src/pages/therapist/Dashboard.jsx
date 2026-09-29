import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, startOfDay, endOfDay, endOfMonth } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { listClients } from '../../api/clients'
import { listSessions } from '../../api/scheduling'
import { Badge, Spinner, StatCard } from '../../components/common/ui'
import { C, S, font } from '../../components/common/theme'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const sessionStatusColors = {
  confirmed: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  completed: { bg: 'rgba(154,184,240,0.15)', text: C.blue },
  'no-show': { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  cancelled: { bg: 'rgba(255,255,255,0.06)', text: C.dim },
}

export default function Dashboard() {
  const { therapist } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [monthSessions, setMonthSessions] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(new Date())
      const monthEnd = endOfMonth(new Date())
      const [clientList, sessions] = await Promise.all([
        listClients(),
        listSessions({ from: monthStart.toISOString(), to: monthEnd.toISOString() }),
      ])
      setClients(clientList)
      setMonthSessions(sessions.filter((s) => {
        const t = new Date(s.start)
        return t >= monthStart && t <= monthEnd
      }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const todaySessions = useMemo(() => {
    const start = startOfDay(new Date())
    const end = endOfDay(new Date())
    return monthSessions
      .filter((s) => s.status !== 'cancelled')
      .filter((s) => { const t = new Date(s.start); return t >= start && t <= end })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }, [monthSessions])

  const stats = useMemo(() => {
    const activeCount = clients.filter((c) => c.status === 'active').length
    const monthStart = startOfMonth(new Date())
    const newThisMonth = clients.filter((c) => new Date(c.createdAt) >= monthStart).length
    const nonCancelled = monthSessions.filter((s) => s.status !== 'cancelled')
    const noShows = monthSessions.filter((s) => s.status === 'no-show').length
    const noShowRate = nonCancelled.length ? ((noShows / nonCancelled.length) * 100).toFixed(1) : '0.0'
    return { activeCount, newThisMonth, sessionsThisMonth: nonCancelled.length, noShowRate, noShows }
  }, [clients, monthSessions])

  const recentActivity = useMemo(() => {
    const clientEvents = clients.map((c) => ({
      ts: new Date(c.createdAt), dot: c.source === 'booking' ? C.amber : C.mint,
      action: c.source === 'booking' ? 'New booking' : 'New client added', detail: c.name,
    }))
    const sessionEvents = monthSessions.map((s) => ({
      ts: new Date(s.createdAt), dot: s.status === 'cancelled' ? C.dim : C.mint,
      action: s.status === 'cancelled' ? 'Session cancelled' : 'Session booked',
      detail: `${s.clientName} — ${format(new Date(s.start), 'd MMM, HH:mm')}`,
    }))
    return [...clientEvents, ...sessionEvents].sort((a, b) => b.ts - a.ts).slice(0, 6)
  }, [clients, monthSessions])

  const quickActions = [
    { label: '+ New session note', run: () => navigate('/dashboard/notes', { state: { newNote: true } }) },
    { label: '+ Add client', run: () => navigate('/dashboard/clients', { state: { openAdd: true } }) },
    { label: 'View billing', run: () => navigate('/dashboard/billing') },
  ]

  const next = todaySessions[0]

  if (loading) return <Spinner label="Loading your practice" />

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...S.eyebrow, marginBottom: 6 }}>{format(new Date(), 'EEEE, d MMMM yyyy').toUpperCase()}</div>
        <h1 style={{ ...S.h1, fontSize: 30 }}>{greeting()}, {therapist?.name}</h1>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          {todaySessions.length === 0 ? 'No sessions today.' : `You have ${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} today.`}
          {next ? ` Next: ${next.clientName} at ${format(new Date(next.start), 'HH:mm')}.` : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="ACTIVE CLIENTS" value={String(stats.activeCount)} sub={`${clients.length} total clients`} trend={stats.newThisMonth ? `+${stats.newThisMonth} this month` : undefined} />
        <StatCard label={`SESSIONS (${format(new Date(), 'MMM').toUpperCase()})`} value={String(stats.sessionsThisMonth)} sub="booked this month" />
        <StatCard label="NO-SHOW RATE" value={`${stats.noShowRate}%`} sub={`${stats.noShows} of ${monthSessions.filter((s) => s.status !== 'cancelled').length} sessions`} />
        <StatCard label="TODAY" value={String(todaySessions.length)} sub="sessions scheduled" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>Today's sessions</div>
            <button onClick={() => navigate('/dashboard/schedule')} style={{ fontSize: 11, color: C.mint, fontFamily: font.mono, background: 'none', border: 'none', cursor: 'pointer' }}>View schedule</button>
          </div>
          {todaySessions.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', fontSize: 13, color: C.dim }}>Nothing booked for today yet.</div>
          ) : todaySessions.map((s, i) => (
            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < todaySessions.length - 1 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 52, textAlign: 'right' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.mint, fontFamily: font.mono }}>{format(new Date(s.start), 'HH:mm')}</span>
              </div>
              <div style={{ width: 3, height: 36, borderRadius: 2, background: (sessionStatusColors[s.status] || sessionStatusColors.confirmed).text, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{s.clientName}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{s.durationMinutes} min</div>
              </div>
              <Badge bg={(sessionStatusColors[s.status] || sessionStatusColors.confirmed).bg} color={(sessionStatusColors[s.status] || sessionStatusColors.confirmed).text}>{s.status}</Badge>
            </div>
          ))}
        </div>

        <div style={{ ...S.card, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.line}`, fontSize: 13, fontWeight: 600, color: C.text2 }}>Recent activity</div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 12, color: C.dim }}>No activity yet.</div>
          ) : recentActivity.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 20px', alignItems: 'flex-start', borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.dot, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text3 }}>{a.action}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{a.detail}</div>
              </div>
              <span style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, whiteSpace: 'nowrap', marginTop: 2 }}>{format(a.ts, 'd MMM')}</span>
            </div>
          ))}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em', marginBottom: 8 }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {quickActions.map((a) => (
                <button key={a.label} onClick={a.run} style={S.btnGhost}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
