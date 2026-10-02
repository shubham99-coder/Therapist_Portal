import { useState } from 'react'
import { useClientAuth } from '../../context/ClientAuthContext'
import BookingWidget from '../../components/client/BookingWidget'
import { Modal, Card } from '../../components/common/ui'
import { C, S } from '../../components/common/theme'

export default function ClientBookingPage() {
  const { therapist } = useClientAuth()
  const [done, setDone] = useState(null)
  if (!therapist) return <div style={{color:C.red}}>Therapist information is unavailable.</div>
  return <div><div style={{marginBottom:24}}><div style={S.eyebrow}>CLIENT PORTAL</div><h1 style={S.h1}>Book a session</h1><p style={{color:C.muted,fontSize:13}}>Choose an available time with {therapist.name}.</p></div><Card bodyStyle={{padding:22}}><BookingWidget slug={therapist.slug} defaultDuration={60} pricing={therapist.sessionPrices || {}} onBooked={setDone} /></Card>{done && <Modal title="Booking confirmed" onClose={()=>setDone(null)}><p style={{color:C.muted,fontSize:13,lineHeight:1.6}}>Your booking is confirmed. Your session will appear in the Sessions section.</p><button type="button" onClick={()=>setDone(null)} style={{padding:'9px 14px',background:C.green,border:0,borderRadius:7,color:'#fff'}}>Done</button></Modal>}</div>
}
