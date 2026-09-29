import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { useEntitlement } from '../../hooks/useEntitlement'
import { useAuth } from '../../context/AuthContext'
import { publicLink } from '../../utils/format'
import { createClient, getClient, listClients, updateClient } from '../../api/clients'
import { Badge, Button, EmptyState, Field, Modal, PageHeader, Spinner, UpgradePrompt } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

const statusColors = {
  active: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  intake: { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  'on-hold': { bg: 'rgba(255,255,255,0.06)', text: C.muted },
}

const sessionStatusColors = {
  confirmed: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  completed: { bg: 'rgba(154,184,240,0.15)', text: C.blue },
  'no-show': { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  cancelled: { bg: 'rgba(255,255,255,0.06)', text: C.dim },
}

const columns = [
  { key: 'name', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'concern', label: 'Presenting concern' },
  { key: 'intake', label: 'Intake' },
]

function AddClientModal({ onClose, onAdd, saving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { status: 'intake' } })
  return (
    <Modal title="Add client" onClose={onClose}>
      <form onSubmit={handleSubmit(onAdd)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="FULL NAME" error={errors.name?.message}>
          <input style={S.input} {...register('name', { required: 'Enter the client name' })} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="AGE" error={errors.age?.message}>
            <input type="number" style={S.input} {...register('age', { min: { value: 1, message: 'Enter a valid age' } })} />
          </Field>
          <Field label="STATUS">
            <select style={S.input} {...register('status')}>
              <option value="intake">Intake</option>
              <option value="active">Active</option>
              <option value="on-hold">On hold</option>
            </select>
          </Field>
        </div>
        <Field label="EMAIL">
          <input type="email" style={S.input} {...register('email')} />
        </Field>
        <Field label="PRESENTING CONCERN" error={errors.concern?.message}>
          <input style={S.input} {...register('concern', { required: 'Add a presenting concern' })} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add client'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Clients() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { getLimit } = useEntitlement()
  const { therapist } = useAuth()

  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historySessions, setHistorySessions] = useState([])
  const [intakeOpen, setIntakeOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [selectedId, setSelectedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [upgrade, setUpgrade] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setClients(await listClients())
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (location.state?.openAdd) {
      setAdding(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const visible = useMemo(() => {
    const list = clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || c.status === filter))
    return [...list].sort((a, b) => {
      const av = a[sort.key] ?? '', bv = b[sort.key] ?? ''
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [clients, search, filter, sort])

  const selected = clients.find((c) => c._id === selectedId)
  const activeCount = clients.filter((c) => c.status === 'active').length

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const openAdd = () => (activeCount >= getLimit('clients.cap') ? setUpgrade(true) : setAdding(true))

  const addClient = async (data) => {
    setAddSaving(true)
    try {
      const client = await createClient({ ...data, name: data.name.trim(), age: data.age ? Number(data.age) : undefined })
      setClients((list) => [client, ...list])
      setAdding(false)
      toast.success(`${client.name} added`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAddSaving(false)
    }
  }

  const setStatus = async (id, status) => {
    try {
      const updated = await updateClient(id, { status })
      setClients((list) => list.map((c) => (c._id === id ? updated : c)))
      toast.success('Status updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const openHistory = async () => {
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const full = await getClient(selected._id)
      setHistorySessions(full.sessions || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setHistoryLoading(false)
    }
  }

  const copyIntakeLink = async () => {
    try {
      await navigator.clipboard.writeText(`${publicLink(therapist.slug)}/intake/${selected._id}`)
      toast.success('Intake link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  const panelActions = [
    { label: 'View session history', run: openHistory },
    { label: 'Add session note', run: () => navigate('/dashboard/notes', { state: { newNote: true, client: selected?.name } }) },
    { label: 'Send invoice', run: () => navigate('/dashboard/billing', { state: { openNew: true, client: selected?.name } }) },
    { label: 'View intake form', run: () => setIntakeOpen(true) },
  ]

  if (loading) return <Spinner label="Loading clients" />

  return (
    <div style={S.page}>
      <PageHeader eyebrow={`${clients.length} CLIENTS`} title="Client CRM" action={<Button onClick={openAdd}>+ Add client</Button>} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." aria-label="Search clients"
          style={{ ...S.input, background: C.card, maxWidth: 320, flex: 1 }} />
        {['all', 'active', 'intake', 'on-hold'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={chip(filter === f)}>{f.replace('-', ' ')}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ ...S.card, overflow: 'hidden' }}>
          {visible.length === 0 ? (
            <EmptyState title={clients.length === 0 ? 'No clients yet' : 'No clients match'} hint={clients.length === 0 ? 'Add your first client, or wait for a booking from your public page.' : 'Try another name or clear the filter.'}
              action={<Button variant="ghost" onClick={() => (clients.length === 0 ? openAdd() : (setSearch(''), setFilter('all')))}>{clients.length === 0 ? '+ Add client' : 'Clear filters'}</Button>} />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                  {columns.map((col) => (
                    <th key={col.key} style={S.th} aria-sort={sort.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                      <button onClick={() => toggleSort(col.key)} style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', letterSpacing: 'inherit', cursor: 'pointer', padding: 0 }}>
                        {col.label.toUpperCase()}{sort.key === col.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((c, i) => (
                  <tr key={c._id} onClick={() => setSelectedId(selectedId === c._id ? null : c._id)}
                    style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.line}` : 'none', background: selectedId === c._id ? 'rgba(45,143,106,0.08)' : 'transparent', cursor: 'pointer' }}>
                    <td style={S.td}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>{c.age ? `Age ${c.age} · ` : ''}since {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td style={S.td}><Badge bg={statusColors[c.status].bg} color={statusColors[c.status].text}>{c.status}</Badge></td>
                    <td style={{ ...S.td, fontSize: 12, color: C.muted, maxWidth: 220 }}>{c.concern || '—'}</td>
                    <td style={S.td}>
                      {c.intake?.submittedAt
                        ? <Badge bg="rgba(45,143,106,0.15)" color={C.mint}>submitted</Badge>
                        : <Badge bg="rgba(255,255,255,0.06)" color={C.dim}>pending</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text }}>{selected.name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{selected.concern || 'No concern noted'}</div>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close panel" style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em' }}>STATUS</span>
                <select value={selected.status} onChange={(e) => setStatus(selected._id, e.target.value)} style={{ ...S.input, width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                  <option value="active">active</option><option value="intake">intake</option><option value="on-hold">on-hold</option>
                </select>
              </div>
              {[
                ['EMAIL', selected.email || '—'], ['PHONE', selected.phone || '—'],
                ['CLIENT SINCE', new Date(selected.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })],
                ['CONSENT', selected.consent?.accepted ? `Given ${new Date(selected.consent.acceptedAt).toLocaleDateString()}` : 'Not yet given'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${C.line}` }}>
                  <span style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em' }}>{label}</span>
                  <span style={{ fontSize: 12, color: C.text3 }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {panelActions.map((a) => (
                  <button key={a.label} onClick={a.run} style={{ ...S.btnGhost, width: '100%', justifyContent: 'space-between' }}>{a.label}<span>→</span></button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {historyOpen && (
        <Modal title={`${selected?.name}'s session history`} onClose={() => setHistoryOpen(false)} width={460}>
          {historyLoading ? (
            <div style={{ fontSize: 13, color: C.dim }}>Loading...</div>
          ) : historySessions.length === 0 ? (
            <div style={{ fontSize: 13, color: C.dim }}>No sessions booked yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
              {historySessions.map((s) => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: `1px solid ${C.line}`, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, color: C.text2, fontWeight: 600 }}>
                      {new Date(s.start).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 11, color: C.dim, fontFamily: font.mono }}>
                      {new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {s.durationMinutes} min
                    </div>
                  </div>
                  <Badge bg={(sessionStatusColors[s.status] || sessionStatusColors.cancelled).bg} color={(sessionStatusColors[s.status] || sessionStatusColors.cancelled).text}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {intakeOpen && selected && (
        <Modal title="Intake form" onClose={() => setIntakeOpen(false)} width={460}>
          {selected.intake?.submittedAt ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 11, color: C.dim, fontFamily: font.mono }}>
                Submitted {new Date(selected.intake.submittedAt).toLocaleDateString()}
              </div>
              {[
                ['Presenting concern', selected.intake.presentingConcern],
                ['History', selected.intake.history],
                ['Occupation', selected.intake.occupation],
                ['Emergency contact', selected.intake.emergencyContact],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em', marginBottom: 4 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{value || '—'}</div>
                </div>
              ))}
              <div style={{ padding: '10px 12px', background: 'rgba(45,143,106,0.08)', border: '1px solid rgba(45,143,106,0.2)', borderRadius: 8, fontSize: 12, color: C.mint }}>
                Consent given {selected.consent?.acceptedAt ? new Date(selected.consent.acceptedAt).toLocaleDateString() : '—'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: C.muted }}>{selected.name} hasn't submitted their intake form yet.</div>
              <div>
                <div style={S.label}>SHARE THIS LINK WITH THEM</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={`${publicLink(therapist.slug)}/intake/${selected._id}`} style={{ ...S.input, flex: 1, fontSize: 12 }} />
                  <Button variant="ghost" onClick={copyIntakeLink}>Copy</Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {adding && <AddClientModal saving={addSaving} onClose={() => setAdding(false)} onAdd={addClient} />}
      {upgrade && <UpgradePrompt feature="More active clients" onClose={() => setUpgrade(false)} />}
    </div>
  )
}
