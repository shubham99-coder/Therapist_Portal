import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { scheduleDays, scheduleHours } from '../../data/mock'
import {
  addBlock as apiAddBlock,
  getAvailability,
  listSessions,
  removeBlock as apiRemoveBlock,
  updateSessionStatus,
} from '../../api/scheduling'
import { Badge, Button, Field, Modal, PageHeader, Spinner } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

const CELL_H = 56
const kindColor = { session: C.green, completed: C.blue, 'no-show': C.amber, blocked: '#6b7f78' }
const statusBadge = {
  confirmed: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  completed: { bg: 'rgba(154,184,240,0.15)', text: C.blue },
  'no-show': { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  cancelled: { bg: 'rgba(255,255,255,0.06)', text: C.dim },
}

// Maps a JS Date's day-of-week onto the Mon..Sat columns this grid renders (index 0-5).
const dayIndexOf = (date) => Math.min(Math.max((date.getDay() + 6) % 7, 0), 5)
// Slots are shown on the hour, so this looks up which row a Date falls on by matching
// its "HH:00" label against the schedule's hour labels (e.g. "09:00").
const hourIndexOf = (date) => scheduleHours.indexOf(format(date, 'HH:00'))

export default function Schedule() {
  const toast = useToast()
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 7)
  const todayIdx = Math.min(Math.max((new Date().getDay() + 6) % 7, 0), 5)

  const [selectedDay, setSelectedDay] = useState(todayIdx)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [blocks, setBlocks] = useState([])
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockSaving, setBlockSaving] = useState(false)
  const [active, setActive] = useState(null)
  const [actionSaving, setActionSaving] = useState(false)
  const [form, setForm] = useState({ day: todayIdx, hour: 1, reason: 'Blocked' })

  const weekLabel = `${format(weekStart, 'd')} – ${format(addDays(weekStart, 6), 'd MMMM yyyy')}`.toUpperCase()

  const loadSessions = useCallback(async () => {
    try {
      const data = await listSessions({ from: weekStart.toISOString(), to: weekEnd.toISOString() })
      setSessions(data || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAvailability = useCallback(async () => {
    try {
      const availability = await getAvailability()
      setBlocks(availability?.blocks || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadSessions(), loadAvailability()]).finally(() => setLoading(false))
  }, [loadSessions, loadAvailability])

  // Real sessions and manual blocks, converted into the {day, hour} grid shape the
  // calendar already knows how to draw. Cancelled sessions are left off the grid
  // entirely since that slot is free again.
  const items = useMemo(() => {
    const fromSessions = sessions
      .filter((s) => s.status !== 'cancelled')
      .map((s) => {
        const start = new Date(s.start)
        if (start < weekStart || start >= weekEnd) return null
        const hour = hourIndexOf(start)
        if (hour === -1) return null
        return {
          id: s._id,
          day: dayIndexOf(start),
          hour,
          name: s.clientName || 'Client',
          sub: `${s.durationMinutes || 60} min`,
          kind: s.status === 'completed' ? 'completed' : s.status === 'no-show' ? 'no-show' : 'session',
          isBlock: false,
          data: s,
        }
      })

    const fromBlocks = blocks.map((b) => {
      const start = new Date(b.start)
      if (start < weekStart || start >= weekEnd) return null
      const hour = hourIndexOf(start)
      if (hour === -1) return null
      return {
        id: b._id,
        day: dayIndexOf(start),
        hour,
        name: b.reason || 'Blocked',
        sub: 'Blocked',
        kind: 'blocked',
        isBlock: true,
        data: b,
      }
    })

    return [...fromSessions, ...fromBlocks].filter(Boolean)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, blocks])

  const addBlock = async () => {
    const clash = items.some((it) => it.day === Number(form.day) && it.hour === Number(form.hour))
    if (clash) return toast.error('That slot already has a session or block.')

    const [hh, mm] = scheduleHours[Number(form.hour)].split(':').map(Number)
    const start = addDays(weekStart, Number(form.day))
    start.setHours(hh, mm || 0, 0, 0)
    const end = new Date(start.getTime() + 60 * 60000)

    setBlockSaving(true)
    try {
      await apiAddBlock({ start: start.toISOString(), end: end.toISOString(), reason: form.reason || 'Blocked' })
      await loadAvailability()
      setBlockOpen(false)
      toast.success('Time blocked')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBlockSaving(false)
    }
  }

  const removeBlock = async (id) => {
    setActionSaving(true)
    try {
      await apiRemoveBlock(id)
      await loadAvailability()
      setActive(null)
      toast.success('Block removed')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionSaving(false)
    }
  }

  const changeStatus = async (status) => {
    setActionSaving(true)
    try {
      await updateSessionStatus(active.id, status)
      await loadSessions()
      setActive(null)
      toast.success(status === 'cancelled' ? 'Session cancelled' : status === 'completed' ? 'Marked completed' : 'Marked as no-show')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={S.page}>
        <PageHeader eyebrow={`WEEK OF ${weekLabel}`} title="Schedule" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      </div>
    )
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

          {items.map((it) => {
            const color = kindColor[it.kind] || C.green
            return (
              <div
                key={`${it.isBlock ? 'b' : 's'}-${it.id}`}
                onClick={() => setActive(it)}
                style={{
                  position: 'absolute', top: it.hour * CELL_H + 2,
                  left: `calc(64px + ${it.day} * (100% - 64px) / 6 + 4px)`,
                  width: 'calc((100% - 64px) / 6 - 8px)', height: CELL_H - 4,
                  background: `${color}22`, border: `1px solid ${color}55`, borderLeft: `3px solid ${color}`,
                  borderRadius: 5, padding: '6px 8px', overflow: 'hidden', cursor: 'pointer',
                  backgroundImage: it.isBlock ? 'repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.04) 6px 12px)' : undefined,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: font.mono }}>{it.sub}</div>
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
              <Button onClick={addBlock} disabled={blockSaving}>{blockSaving ? 'Blocking...' : 'Block time'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {active && (
        <Modal title={active.name} onClose={() => setActive(null)} width={380}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            {scheduleDays[active.day]} {format(addDays(weekStart, active.day), 'd MMM')}, {scheduleHours[active.hour]}
          </div>

          {!active.isBlock && (
            <>
              <Badge bg={(statusBadge[active.data.status] || statusBadge.confirmed).bg} color={(statusBadge[active.data.status] || statusBadge.confirmed).text}>
                {active.data.status}
              </Badge>
              {(active.data.clientEmail || active.data.clientPhone) && (
                <div style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
                  {[active.data.clientEmail, active.data.clientPhone].filter(Boolean).join(' · ')}
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {active.isBlock ? (
              <Button onClick={() => removeBlock(active.id)} disabled={actionSaving}>{actionSaving ? 'Removing...' : 'Remove block'}</Button>
            ) : active.data.status === 'confirmed' ? (
              <>
                <Button variant="ghost" onClick={() => changeStatus('completed')} disabled={actionSaving}>Mark completed</Button>
                <Button variant="ghost" onClick={() => changeStatus('no-show')} disabled={actionSaving}>No-show</Button>
                <Button variant="ghost" onClick={() => changeStatus('cancelled')} disabled={actionSaving}>Cancel session</Button>
              </>
            ) : null}
            <Button variant="ghost" onClick={() => setActive(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
