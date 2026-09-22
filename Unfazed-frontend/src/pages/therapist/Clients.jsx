import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useToast } from '../../context/ToastContext'
import { useEntitlement } from '../../hooks/useEntitlement'
import { initialClients } from '../../data/mock'
import { inr } from '../../utils/format'
import { Badge, Button, EmptyState, Field, Modal, PageHeader, UpgradePrompt } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

const statusColors = {
  active: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  intake: { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  'on-hold': { bg: 'rgba(255,255,255,0.06)', text: C.muted },
}

const columns = [
  { key: 'name', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'concern', label: 'Presenting concern' },
  { key: 'nextSession', label: 'Next session' },
  { key: 'balance', label: 'Balance' },
]

function AddClientModal({ onClose, onAdd }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { status: 'intake' } })
  return (
    <Modal title="Add client" onClose={onClose}>
      <form onSubmit={handleSubmit(onAdd)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="FULL NAME" error={errors.name?.message}>
          <input style={S.input} {...register('name', { required: 'Enter the client name' })} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="AGE" error={errors.age?.message}>
            <input type="number" style={S.input} {...register('age', { required: 'Enter age', min: { value: 1, message: 'Enter a valid age' } })} />
          </Field>
          <Field label="STATUS">
            <select style={S.input} {...register('status')}>
              <option value="intake">Intake</option>
              <option value="active">Active</option>
              <option value="on-hold">On hold</option>
            </select>
          </Field>
        </div>
        <Field label="PRESENTING CONCERN" error={errors.concern?.message}>
          <input style={S.input} {...register('concern', { required: 'Add a presenting concern' })} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add client</Button>
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

  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [selectedId, setSelectedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [upgrade, setUpgrade] = useState(false)

  // Opened from the dashboard quick action
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
      const av = a[sort.key], bv = b[sort.key]
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [clients, search, filter, sort])

  const selected = clients.find((c) => c.id === selectedId)
  const activeCount = clients.filter((c) => c.status === 'active').length

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const openAdd = () => (activeCount >= getLimit('clients.cap') ? setUpgrade(true) : setAdding(true))

  const addClient = (data) => {
    setClients((list) => [...list, {
      id: Date.now(), name: data.name.trim(), age: Number(data.age), status: data.status, concern: data.concern.trim(),
      since: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), sessions: 0, nextSession: '—', balance: 0,
    }])
    setAdding(false)
    toast.success(`${data.name.trim()} added`)
  }

  const setStatus = (id, status) => {
    setClients((list) => list.map((c) => (c.id === id ? { ...c, status } : c)))
    toast.success('Status updated')
  }

  const panelActions = [
    { label: 'View session history', run: () => toast.info('Session history arrives with Module 3') },
    { label: 'Add session note', run: () => navigate('/dashboard/notes', { state: { newNote: true, client: selected?.name } }) },
    { label: 'Send invoice', run: () => navigate('/dashboard/billing', { state: { openNew: true, client: selected?.name } }) },
    { label: 'View intake form', run: () => toast.info('Intake forms arrive with Module 3') },
  ]

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
            <EmptyState title="No clients match" hint="Try another name or clear the filter." action={<Button variant="ghost" onClick={() => { setSearch(''); setFilter('all') }}>Clear filters</Button>} />
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
                  <tr key={c.id} onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                    style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.line}` : 'none', background: selectedId === c.id ? 'rgba(45,143,106,0.08)' : 'transparent', cursor: 'pointer' }}>
                    <td style={S.td}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>Age {c.age} · since {c.since}</div>
                    </td>
                    <td style={S.td}><Badge bg={statusColors[c.status].bg} color={statusColors[c.status].text}>{c.status}</Badge></td>
                    <td style={{ ...S.td, fontSize: 13, color: C.text3, fontFamily: font.mono }}>{c.sessions}</td>
                    <td style={{ ...S.td, fontSize: 12, color: C.muted, maxWidth: 200 }}>{c.concern}</td>
                    <td style={{ ...S.td, fontSize: 12, color: C.text3, fontFamily: font.mono, whiteSpace: 'nowrap' }}>{c.nextSession}</td>
                    <td style={{ ...S.td, fontSize: 12, fontFamily: font.mono, color: c.balance > 0 ? C.amber : C.muted }}>{c.balance > 0 ? inr(c.balance) : '—'}</td>
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
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{selected.concern}</div>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close panel" style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ padding: '9px 0', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, letterSpacing: '0.06em' }}>STATUS</span>
                <select value={selected.status} onChange={(e) => setStatus(selected.id, e.target.value)} style={{ ...S.input, width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                  <option value="active">active</option><option value="intake">intake</option><option value="on-hold">on-hold</option>
                </select>
              </div>
              {[
                ['AGE', selected.age], ['CLIENT SINCE', selected.since], ['TOTAL SESSIONS', selected.sessions],
                ['NEXT SESSION', selected.nextSession], ['OUTSTANDING', selected.balance > 0 ? inr(selected.balance) : 'Nil'],
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

      {adding && <AddClientModal onClose={() => setAdding(false)} onAdd={addClient} />}
      {upgrade && <UpgradePrompt feature="More active clients" onClose={() => setUpgrade(false)} />}
    </div>
  )
}
