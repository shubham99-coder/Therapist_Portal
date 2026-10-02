import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { listNotifications, markNotificationRead } from '../../api/notifications'
import { TOKEN_KEY } from '../../api/axiosInstance'
import { C, font } from '../common/theme'

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'

export default function NotificationBell({ userId }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) return
    let active = true
    listNotifications()
      .then((data) => { if (active) setItems(data.notifications || []) })
      .catch((err) => console.error('Failed to load notifications:', err))

    const token = localStorage.getItem(TOKEN_KEY)
    const socket = io(socketUrl, { transports: ['websocket', 'polling'], auth: { token } })
    socket.on('newNotification', (notification) => setItems((prev) => [notification, ...prev]))
    return () => { active = false; socket.disconnect() }
  }, [userId])

  const unread = items.filter((item) => !item.read).length

  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id)
        setItems((prev) => prev.map((item) => item._id === notification._id ? { ...item, read: true } : item))
      } catch (err) { console.error('Failed to mark notification read:', err) }
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.line}`, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1a4 4 0 014 4v2.5l1.5 2H1.5L3 7.5V5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 12, height: 12, padding: '0 3px', borderRadius: 20, background: C.amber, color: C.bg, fontSize: 7, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.mono }}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 40, width: 340, maxWidth: 'calc(100vw - 32px)', maxHeight: 420, overflowY: 'auto', background: C.side, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,.35)', zIndex: 100 }}>
          <div style={{ padding: '13px 14px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Notifications</div>
            <button type="button" onClick={() => { setOpen(false); navigate('/dashboard/notifications') }} style={{ background: 'transparent', border: 0, color: C.mint, fontSize: 9, cursor: 'pointer', fontFamily: font.mono }}>VIEW ALL</button>
          </div>
          {!items.length ? <div style={{ padding: 18, color: C.dim, fontSize: 11 }}>No notifications.</div> : items.slice(0, 10).map((item) => (
            <button key={item._id} type="button" onClick={() => openNotification(item)} style={{ width: '100%', textAlign: 'left', border: 0, borderBottom: `1px solid ${C.line}`, padding: 13, background: item.read ? 'transparent' : 'rgba(45,143,106,0.08)', color: C.text, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{item.title}</div>
              <div style={{ marginTop: 4, fontSize: 10, color: C.muted, lineHeight: 1.5 }}>{item.message}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
