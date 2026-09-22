import { useState } from 'react'
import { C } from './theme'

export default function TagInput({ values, onChange, placeholder = 'Add and press Enter' }) {
  const [text, setText] = useState('')

  const add = () => {
    const v = text.trim()
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v])
    setText('')
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {values.map((s) => (
        <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(45,143,106,0.15)', border: '1px solid rgba(45,143,106,0.25)', borderRadius: 20, fontSize: 12, color: C.mint }}>
          {s}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== s))} aria-label={`Remove ${s}`} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder={placeholder}
        style={{ background: 'transparent', border: `1px dashed ${C.green}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, color: C.text2, outline: 'none', minWidth: 150 }}
      />
    </div>
  )
}
