import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientOverview } from '../../api/clientPortal'
import { C, S, font } from '../../components/common/theme'
import { Spinner, Card } from '../../components/common/ui'

export default function ClientOverview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getClientOverview().then(setData).catch((e) => setError(e.response?.data?.message || 'Could not load portal')) }, [])
  if (!data && !error) return <Spinner label="Loading client portal" />
  if (error) return <div style={{ color: C.red }}>{error}</div>
  const next = data.sessions.find((s) => new Date(s.start) >= new Date() && !['cancelled','completed','no-show'].includes(s.status))
  return (
    <div>
      <div style={{ marginBottom: 26 }}><div style={S.eyebrow}>CLIENT PORTAL</div><h1 style={S.h1}>Hello, {data.client.name}</h1><p style={{ color: C.muted, fontSize: 13 }}>Your sessions, payments, shared notes and conversation in one place.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        <Card title="Next session" bodyStyle={{ padding: 20 }}>{next ? <><div style={{ fontFamily: font.serif, fontSize: 19 }}>{new Date(next.start).toLocaleDateString([], { weekday:'long', day:'numeric', month:'long' })}</div><div style={{ marginTop: 5, color:C.muted, fontSize:12 }}>{new Date(next.start).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · {next.durationMinutes} min</div></> : <div style={{ color:C.dim, fontSize:12 }}>No upcoming session.</div>}</Card>
        <Card title="Shared notes" bodyStyle={{ padding: 20 }}><div style={{ fontFamily:font.serif, fontSize:28 }}>{data.notes.length}</div><Link to="/client/portal/notes" style={{ color:C.mint, fontSize:11 }}>View shared notes</Link></Card>
        <Card title="Payments" bodyStyle={{ padding:20 }}><div style={{ fontFamily:font.serif, fontSize:28 }}>{data.payments.length}</div><Link to="/client/portal/payments" style={{ color:C.mint, fontSize:11 }}>View payments & invoices</Link></Card>
      </div>
      <div style={{ marginTop:16 }}><Card title="Your therapist" bodyStyle={{ padding:20 }}><div style={{ fontFamily:font.serif, fontSize:21 }}>{data.therapist?.name}</div><p style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>{data.therapist?.bio || 'Your therapist has not added a bio yet.'}</p><Link to="/client/portal/chat" style={{ color:C.mint, fontSize:11 }}>Open chat</Link></Card></div>
    </div>
  )
}
