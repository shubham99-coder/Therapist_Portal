import { Link } from 'react-router-dom'
import { C, font } from '../../components/common/theme'

export default function NotFound({ message = 'This page does not exist.' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, textAlign: 'center', padding: 24 }}>
      <div style={{ fontFamily: font.serif, fontSize: 40, color: C.text, marginBottom: 8 }}>Page not found</div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>{message}</p>
      <Link to="/" style={{ color: C.mint, fontSize: 13 }}>Go to Unfazed</Link>
    </div>
  )
}
