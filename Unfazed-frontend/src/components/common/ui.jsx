import { useEffect } from 'react'
import { C, S, font } from './theme'

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <div>
        {eyebrow && <div style={S.eyebrow}>{eyebrow}</div>}
        <h1 style={S.h1}>{title}</h1>
      </div>
      {action}
    </div>
  )
}

export function Button({ variant = 'primary', style, ...props }) {
  const base = variant === 'primary' ? S.btnPrimary : S.btnGhost
  return <button {...props} style={{ ...base, ...(props.disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}), ...style }} />
}

export function Card({ title, right, children, style, bodyStyle }) {
  return (
    <div style={{ ...S.card, overflow: 'hidden', ...style }}>
      {title && (
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{title}</div>
          {right}
        </div>
      )}
      <div style={bodyStyle}>{children}</div>
    </div>
  )
}

export function StatCard({ label, value, sub, trend, tone }) {
  const border = tone === 'danger' ? 'rgba(239,68,68,0.2)' : tone === 'warn' ? 'rgba(240,169,110,0.2)' : C.line
  const valueColor = tone === 'danger' ? C.red : tone === 'warn' ? C.amber : C.text
  return (
    <div style={{ background: C.card, border: `1px solid ${border}`, borderRadius: 10, padding: '20px 24px' }}>
      <div style={{ fontSize: 10, color: C.dim, fontFamily: font.mono, letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: font.serif, fontSize: 30, color: valueColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>}
      {trend && <div style={{ fontSize: 11, color: C.mint, marginTop: 6, fontFamily: font.mono }}>{trend}</div>}
    </div>
  )
}

export function Badge({ children, bg, color }) {
  return <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontFamily: font.mono, background: bg, color }}>{children}</span>
}

export function Field({ label, error, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
      {error && <div role="alert" style={{ fontSize: 11, color: C.red, marginTop: 5 }}>{error}</div>}
    </div>
  )
}

export function Modal({ title, onClose, children, width = 440 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,12,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ ...S.card, width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ title, hint, action }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text2, marginBottom: 6 }}>{title}</div>
      {hint && <div style={{ fontSize: 12, color: C.dim, marginBottom: 16 }}>{hint}</div>}
      {action}
    </div>
  )
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.dim, fontFamily: font.mono, fontSize: 12 }}>
      {label}...
    </div>
  )
}

// Shown when a gated action is blocked (wired to real data in Module 7)
export function UpgradePrompt({ feature, onClose }) {
  return (
    <Modal title="Upgrade to continue" onClose={onClose} width={400}>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginTop: 0 }}>
        {feature} is not part of your current plan. Move to a higher plan to use it.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>Not now</Button>
        <Button onClick={onClose}>View plans</Button>
      </div>
    </Modal>
  )
}
