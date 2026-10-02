import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { getClientMessages, markClientMessagesRead } from '../../api/clientChat'
import { CLIENT_TOKEN_KEY } from '../../api/clientAxios'
import { useClientAuth } from '../../context/ClientAuthContext'
import MessageBubble from '../../components/chat/MessageBubble'
import { C, S, font } from '../../components/common/theme'
import { Spinner } from '../../components/common/ui'

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'

export default function ClientChat(){
  const { client, therapist } = useClientAuth()
  const [messages,setMessages]=useState(null); const [text,setText]=useState(''); const [connected,setConnected]=useState(false); const [typing,setTyping]=useState(false)
  const socketRef=useRef(null); const timer=useRef(null)
  useEffect(()=>{
    if(!client?.id||!therapist?._id)return
    let active=true
    getClientMessages(therapist._id).then(d=>{if(active)setMessages(d.messages||[]);return markClientMessagesRead(therapist._id)}).catch(()=>{if(active)setMessages([])})
    const token=localStorage.getItem(CLIENT_TOKEN_KEY)
    const socket=io(socketUrl,{transports:['websocket','polling'],auth:{token}});socketRef.current=socket
    socket.on('connect',()=>{setConnected(true);socket.emit('joinConversation',{therapistId:therapist._id,clientId:client.id});socket.emit('markRead',{therapistId:therapist._id,clientId:client.id})})
    socket.on('disconnect',()=>setConnected(false))
    socket.on('messagesRead', ({ userId }) => { if (String(userId) !== String(client.id)) setMessages((prev) => prev.map((m) => String(m.sender) === String(client.id) ? { ...m, read: true } : m)) })
    socket.on('newMessage',(m)=>setMessages(prev=>prev?.some(x=>x._id===m._id)?prev:[...(prev||[]),m]))
    socket.on('userTyping',({userId})=>{if(String(userId)!==String(client.id))setTyping(true)})
    socket.on('userStoppedTyping',({userId})=>{if(String(userId)!==String(client.id))setTyping(false)})
    return()=>{active=false;clearTimeout(timer.current);socket.disconnect();socketRef.current=null}
  },[client?.id,therapist?._id])
  if(!messages)return <Spinner label="Loading chat"/>
  const change=(value)=>{setText(value);const s=socketRef.current;if(!s)return;s.emit('typing',{therapistId:therapist._id,clientId:client.id});clearTimeout(timer.current);timer.current=setTimeout(()=>s.emit('stopTyping',{therapistId:therapist._id,clientId:client.id}),700)}
  const send=()=>{const value=text.trim();const s=socketRef.current;if(!value||!s||!connected)return;s.emit('sendMessage',{therapistId:therapist._id,clientId:client.id,text:value});setText('')}
  return <div style={{height:'calc(100vh - 112px)',minHeight:520,display:'flex',flexDirection:'column',border:`1px solid ${C.line}`,borderRadius:12,overflow:'hidden',background:C.bg}}><div style={{padding:'14px 18px',borderBottom:`1px solid ${C.line}`,background:C.side,display:'flex',justifyContent:'space-between'}}><div><div style={{fontSize:13,fontWeight:600}}>{therapist.name}</div><div style={{fontSize:9,color:connected?C.mint:C.dim,fontFamily:font.mono}}>{connected?'Connected':'Connecting...'}</div></div><div style={{fontSize:9,color:C.dim}}>Private conversation</div></div><div style={{flex:1,overflowY:'auto',padding:18}}>{messages.length?messages.map(m=><MessageBubble key={m._id} message={m} currentUserId={client.id}/>):<div style={{textAlign:'center',color:C.dim,fontSize:12,paddingTop:100}}>No messages yet. Send a message to your therapist.</div>}{typing&&<div style={{fontSize:10,color:C.dim}}>Therapist is typing...</div>}</div><div style={{padding:12,borderTop:`1px solid ${C.line}`,background:C.side}}><div style={{display:'flex',gap:8,alignItems:'flex-end'}}><textarea value={text} onChange={e=>change(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} rows={2} placeholder="Write a message..." style={{...S.input,flex:1,resize:'none'}}/><button type="button" onClick={send} disabled={!text.trim()||!connected} style={{...S.btnPrimary,height:42,opacity: (!text.trim() || !connected) ? 0.45 : 1}}>Send</button></div></div></div>
}
