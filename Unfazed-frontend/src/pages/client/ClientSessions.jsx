import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClientSessions } from '../../api/clientPortal'
import { C, S, font } from '../../components/common/theme'
import { Card, Spinner, EmptyState } from '../../components/common/ui'

export default function ClientSessions() {
  const [sessions, setSessions] = useState(null)
  useEffect(() => { getClientSessions().then((d) => setSessions(d.sessions)).catch(() => setSessions([])) }, [])
  if (!sessions) return <Spinner label="Loading sessions" />
  return <div><div style={{ marginBottom:24 }}><div style={S.eyebrow}>CLIENT PORTAL</div><h1 style={S.h1}>Sessions</h1></div><Card>{sessions.length ? <div>{sessions.map((s) => <div key={s._id} style={{ padding:'16px 20px', borderBottom:`1px solid ${C.line}`, display:'flex', justifyContent:'space-between', gap:15, flexWrap:'wrap' }}><div><div style={{fontWeight:600,fontSize:13}}>{new Date(s.start).toLocaleDateString([], {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><div style={{color:C.muted,fontSize:11,marginTop:4}}>{new Date(s.start).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · {s.durationMinutes} min</div></div><div style={{color:s.status==='confirmed'?C.mint:C.muted,fontFamily:font.mono,fontSize:9}}>{s.status.toUpperCase()}</div></div>)}</div> : <EmptyState title="No sessions yet" hint="Book your next session with your therapist." action={<Link to="/client/portal/book" style={{color:C.mint,fontSize:12}}>Book a session</Link>} />}</Card></div>
}
