// Design tokens taken from the original Unfazed dashboard
export const C = {
  bg: '#0e1a1f', side: '#0b1519', card: '#0e1f25', line: '#1c2d33',
  text: '#e2ebe8', text2: '#c5ddd6', text3: '#9cbfb5',
  muted: '#5c8a78', dim: '#4a7a68', faint: '#334d43',
  green: '#2d8f6a', mint: '#7ecfae', amber: '#f0a96e', blue: '#9ab8f0', purple: '#c17ae8', red: '#f87171',
}

export const font = {
  serif: "'DM Serif Display', Georgia, serif",
  mono: "'DM Mono', monospace",
}

// Reusable style objects
export const S = {
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: 10 },
  page: { padding: '32px 36px', maxWidth: 1200, width: '100%' },
  h1: { fontFamily: font.serif, fontSize: 28, color: C.text, margin: 0, letterSpacing: '-0.02em' },
  eyebrow: { fontSize: 11, color: C.dim, fontFamily: font.mono, letterSpacing: '0.08em', marginBottom: 4 },
  label: { fontSize: 11, color: C.dim, fontFamily: font.mono, display: 'block', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', background: C.side, border: `1px solid ${C.line}`, borderRadius: 8, color: C.text2, fontSize: 13, outline: 'none' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 16px', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.line}`, borderRadius: 7, color: C.muted, fontSize: 12, cursor: 'pointer' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em', fontWeight: 500 },
  td: { padding: '12px 16px' },
}

export const chip = (active, color = C.green) => ({
  padding: '8px 14px', borderRadius: 8, border: '1px solid',
  borderColor: active ? color : C.line,
  background: active ? `${color}26` : 'transparent',
  color: active ? C.mint : C.dim,
  fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
})
