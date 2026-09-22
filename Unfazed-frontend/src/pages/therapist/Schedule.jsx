import { useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { useToast } from '../../context/ToastContext'
import { initialBlocks, scheduleDays, scheduleHours } from '../../data/mock'
import { Button, Field, Modal, PageHeader } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

const CELL_H = 56
const kindColor = { session: C.green, couples: C.blue, group: C.purple, pending: C.amber, blocked: '#6b7f78' }

export default function Schedule() {
  const toast = useToast()
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const todayIdx = Math.min(Math.max((new Date().getDay() + 6) % 7, 0), 5)
  const [selectedDay, setSelectedDay] = useState(todayIdx)
  const [blocks, setBlocks] = useState(initialBlocks)
  const [blockOpen, setBlockOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState({ day: todayIdx, hour: 1, reason: 'Blocked' })

  const weekLabel = `${format(weekStart, 'd')} – ${format(addDays(weekStart, 6), 'd MMMM yyyy')}`.toUpperCase()

  const addBlock = () => {
    const clash = blocks.some((b) => b.day === Number(form.day) && b.hour === Number(form.hour))
    if (clash) return toast.error('That slot already has a session or block.')
    setBlocks((b) => [...b, { id: Date.now(), day: Number(form.day), hour: Number(form.hour), name: form.reason || 'Blocked', kind: 'blocked' }])
    setBlockOpen(false)
    toast.success('Time blocked')
  }

  const removeBlock = (id) => {
    setBlocks((b) => b.filter((x) => x.id !== id))
    setActive(null)
    toast.success('Block removed')
  }

  return (
    <div style={S.page}>
      <PageHeader eyebrow={`WEEK OF ${weekLabel}`} title="Schedule" action={<Button onClick={() => setBlockOpen(true)}>+ Block time</Button>} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {scheduleDays.map((d, i) => (
          <button key={d} onClick={() => setSelectedDay(i)} style={chip(selectedDay === i)}>{d}</button>
        ))}
      </div>

      <div style={{ ...S.card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(6, 1fr)', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ borderRight: `1px solid ${C.line}` }} />
          {scheduleDays.map((d, i) => (
            <div key={d} style={{ padding: '12px 0', textAlign: 'center', borderRight: i < 5 ? `1px solid ${C.line}` : 'none', fontSize: 11, fontFamily: font.mono, color: selectedDay === i ? C.mint : C.dim }}>
              {d} {format(addDays(weekStart, i), 'd')}
            </div>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          {scheduleHours.map((h, hi) => (
            <div key={h} style={{ display: 'grid', gridTemplateColumns: '64px repeat(6, 1fr)', borderBottom: hi < scheduleHours.length - 1 ? `1px solid ${C.line}` : 'none', height: CELL_H }}>
              <div style={{ padding: '6px 12px', borderRight: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 10, color: C.faint, fontFamily: font.mono }}>{h}</span>
              </div>
              {scheduleDays.map((_, di) => (
                <div key={di} style={{ borderRight: di < 5 ? `1px solid ${C.line}` : 'none', background: selectedDay === di ? 'rgba(45,143,106,0.03)' : 'transparent' }} />
              ))}
            </div>
          ))}

          {blocks.map((b) => {
            const color = kindColor[b.kind] || C.green
            return (
              <div
                key={b.id}
                onClick={() => setActive(b)}
                style={{
                  position: 'absolute', top: b.hour * CELL_H + 2,
                  left: `calc(64px + ${b.day} * (100% - 64px) / 6 + 4px)`,
                  width: 'calc((100% - 64px) / 6 - 8px)', height: CELL_H - 4,
                  background: `${color}22`, border: `1px solid ${color}55`, borderLeft: `3px solid ${color}`,
                  borderRadius: 5, padding: '6px 8px', overflow: 'hidden', cursor: 'pointer',
                  backgroundImage: b.kind === 'blocked' ? 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.04) 6px 12px)' : undefined,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>{b.kind === 'blocked' ? 'Blocked' : '60 min'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {blockOpen && (
        <Modal title="Block time" onClose={() => setBlockOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="DAY">
              <select style={S.input} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                {scheduleDays.map((d, i) => <option key={d} value={i}>{d} {format(addDays(weekStart, i), 'd MMM')}</option>)}
              </select>
            </Field>
            <Field label="START TIME">
              <select style={S.input} value={form.hour} onChange={(e) => setForm({ ...form, hour: e.target.value })}>
                {scheduleHours.map((h, i) => <option key={h} value={i}>{h}</option>)}
              </select>
            </Field>
            <Field label="REASON">
              <input style={S.input} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" onClick={() => setBlockOpen(false)}>Cancel</Button>
              <Button onClick={addBlock}>Block time</Button>
            </div>
          </div>
        </Modal>
      )}

      {active && (
        <Modal title={active.name} onClose={() => setActive(null)} width={380}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>
            {scheduleDays[active.day]} {format(addDays(weekStart, active.day), 'd MMM')}, {scheduleHours[active.hour]}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {active.kind === 'blocked'
              ? <Button onClick={() => removeBlock(active.id)}>Remove block</Button>
              : <Button variant="ghost" onClick={() => { setActive(null); toast.info('Rescheduling arrives with Module 2') }}>Reschedule</Button>}
            <Button variant="ghost" onClick={() => setActive(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
