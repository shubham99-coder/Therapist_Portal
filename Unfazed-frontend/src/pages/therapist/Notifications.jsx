import { useEffect,useState } from 'react'
import { listNotifications,markNotificationRead,markAllNotificationsRead } from '../../api/notifications'

export default function Notifications() {
  const [items,setItems]=useState([])
  const [unread,setUnread]=useState(0)
  const [loading,setLoading]=useState(true)

  const load=async()=>{try{const data=await listNotifications();setItems(data.notifications||[]);setUnread(data.unreadCount||0)}catch(err){console.error('Failed to load notifications:',err)}finally{setLoading(false)}}
  useEffect(()=>{load()},[])

  const read=async(id)=>{try{await markNotificationRead(id);setItems(p=>p.map(x=>x._id===id?{...x,read:true}:x));setUnread(n=>Math.max(0,n-1))}catch(err){console.error(err)}}
  const readAll=async()=>{try{await markAllNotificationsRead();setItems(p=>p.map(x=>({...x,read:true})));setUnread(0)}catch(err){console.error(err)}}

  if(loading) return <div>Loading notifications...</div>
  return <div style={{maxWidth:850}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div><h2 style={{marginBottom:4}}>Notifications</h2><div style={{opacity:.65}}>{unread} unread</div></div>
      <button type="button" onClick={readAll} disabled={!unread}>Mark all as read</button>
    </div>
    {!items.length ? <div>No notifications yet.</div> : items.map(item=><button key={item._id} type="button" onClick={()=>!item.read&&read(item._id)} style={{width:'100%',textAlign:'left',border:'1px solid #e5e7eb',borderRadius:14,padding:16,marginBottom:10,background:item.read?'#fff':'#f5f7ff'}}>
      <div style={{fontWeight:700}}>{item.title}</div><div style={{marginTop:6}}>{item.message}</div><small style={{opacity:.6}}>{new Date(item.createdAt).toLocaleString()}</small>
    </button>)}
  </div>
}
