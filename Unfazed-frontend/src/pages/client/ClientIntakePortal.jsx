import { useEffect, useState } from 'react'
import { getClientIntake, submitClientIntake } from '../../api/clientPortal'
import { C, S } from '../../components/common/theme'
import { Button, Card, Field, Spinner } from '../../components/common/ui'
import { getErrorMessage } from '../../utils/errors'

export default function ClientIntakePortal() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState({presentingConcern:'',history:'',occupation:'',emergencyContact:'',consent:false})
  const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [saved,setSaved]=useState(false)
  useEffect(()=>{getClientIntake().then((d)=>{setData(d);setForm({presentingConcern:d.intake?.presentingConcern||'',history:d.intake?.history||'',occupation:d.intake?.occupation||'',emergencyContact:d.intake?.emergencyContact||'',consent:!!d.consent?.accepted})}).catch((e)=>setError(getErrorMessage(e)))},[])
  if(!data && !error)return <Spinner label="Loading intake" />
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}))
  const submit=async(e)=>{e.preventDefault();if(!form.presentingConcern.trim()||!form.consent){setError('Presenting concern and consent are required.');return}setBusy(true);setError('');try{await submitClientIntake(form);setSaved(true)}catch(err){setError(getErrorMessage(err))}finally{setBusy(false)}}
  return <div><div style={{marginBottom:24}}><div style={S.eyebrow}>CLIENT PORTAL</div><h1 style={S.h1}>Intake & consent</h1><p style={{color:C.muted,fontSize:13}}>Keep your intake information up to date for your therapist.</p></div><Card bodyStyle={{padding:24}}><form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}><Field label="WHAT BRINGS YOU HERE?"><textarea rows={4} style={{...S.input,resize:'vertical'}} value={form.presentingConcern} onChange={set('presentingConcern')} /></Field><Field label="RELEVANT HISTORY"><textarea rows={4} style={{...S.input,resize:'vertical'}} value={form.history} onChange={set('history')} /></Field><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><Field label="OCCUPATION"><input style={S.input} value={form.occupation} onChange={set('occupation')} /></Field><Field label="EMERGENCY CONTACT"><input style={S.input} value={form.emergencyContact} onChange={set('emergencyContact')} /></Field></div><label style={{display:'flex',gap:8,fontSize:12,color:C.muted}}><input type="checkbox" checked={form.consent} onChange={e=>setForm(f=>({...f,consent:e.target.checked}))}/><span>I consent to sharing this information with my therapist. Private therapist notes are not exposed through the client portal.</span></label>{error&&<div style={{color:C.red,fontSize:12}}>{error}</div>}{saved&&<div style={{color:C.mint,fontSize:12}}>Intake saved.</div>}<Button disabled={busy}>{busy?'Saving...':'Save intake'}</Button></form></Card></div>
}
