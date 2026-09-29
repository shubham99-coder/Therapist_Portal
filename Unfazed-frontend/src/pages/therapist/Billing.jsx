import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { inr } from '../../utils/format'
import { listPayments, invoiceUrl } from '../../api/payments'
import { listMyPackages, createPackage, updatePackage, deletePackage } from '../../api/packages'
import { Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Spinner, StatCard } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

const paymentStatus = {
  paid: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  created: { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  failed: { bg: 'rgba(239,68,68,0.15)', text: C.red },
}

function NewPackageModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', sessions: 6, rate: 2800, validityDays: 120 })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.name.trim()) err.name = 'Enter a package name'
    if (!form.sessions || form.sessions < 1) err.sessions = 'Must be at least 1 session'
    if (!form.rate || form.rate < 1) err.rate = 'Enter a per-session rate'
    setErrors(err)
    if (Object.keys(err).length) return
    setSaving(true)
    try {
      await onCreate({ ...form, sessions: Number(form.sessions), rate: Number(form.rate), validityDays: Number(form.validityDays) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="New package" onClose={onClose}>
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="NAME" error={errors.name}>
          <input style={S.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Starter" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="SESSIONS" error={errors.sessions}>
            <input type="number" style={S.input} value={form.sessions} onChange={(e) => setForm({ ...form, sessions: e.target.value })} />
          </Field>
          <Field label="RATE PER SESSION (₹)" error={errors.rate}>
            <input type="number" style={S.input} value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
          </Field>
        </div>
        <Field label="VALID FOR (DAYS)">
          <input type="number" style={S.input} value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: e.target.value })} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add package'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Billing() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [packages, setPackages] = useState([])
  const [filter, setFilter] = useState('all')
  const [creatingPkg, setCreatingPkg] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, pkgs] = await Promise.all([listPayments(), listMyPackages()])
      setPayments(p)
      setPackages(pkgs)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  const sum = (status) => payments.filter((p) => p.status === status).reduce((t, p) => t + p.amount, 0)
  const count = (status) => payments.filter((p) => p.status === status).length
  const visible = useMemo(() => payments.filter((p) => filter === 'all' || p.status === filter), [payments, filter])

  const addPackage = async (data) => {
    try {
      const pkg = await createPackage(data)
      setPackages((list) => [...list, pkg])
      setCreatingPkg(false)
      toast.success(`${pkg.name} package added`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const togglePackage = async (pkg) => {
    try {
      const updated = await updatePackage(pkg._id, { active: !pkg.active })
      setPackages((list) => list.map((p) => (p._id === pkg._id ? updated : p)))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const removePackage = async (pkg) => {
    if (!window.confirm(`Delete "${pkg.name}"? Clients who already bought it keep their sessions.`)) return
    try {
      await deletePackage(pkg._id)
      setPackages((list) => list.filter((p) => p._id !== pkg._id))
      toast.success('Package deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <Spinner label="Loading billing" />

  return (
    <div style={S.page}>
      <PageHeader eyebrow="PAYMENTS & PACKAGES" title="Billing" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="COLLECTED" value={inr(sum('paid'))} sub={`from ${count('paid')} payments`} />
        <StatCard label="AWAITING PAYMENT" value={inr(sum('created'))} sub={`${count('created')} orders started, not yet paid`} tone="warn" />
        <StatCard label="FAILED" value={inr(sum('failed'))} sub={`${count('failed')} attempts failed`} tone="danger" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text2, fontFamily: font.mono, letterSpacing: '0.06em' }}>SESSION PACKAGES</div>
          <Button onClick={() => setCreatingPkg(true)}>+ New package</Button>
        </div>
        {packages.length === 0 ? (
          <div style={{ ...S.card, padding: 20, textAlign: 'center', fontSize: 13, color: C.dim }}>No packages yet. Clients can only pay per session until you add one.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {packages.map((pkg) => (
              <div key={pkg._id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: '16px 20px', opacity: pkg.active ? 1 : 0.55 }}>
                <div style={{ fontFamily: font.serif, fontSize: 20, color: C.text, marginBottom: 4 }}>{pkg.sessions} sessions</div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>{pkg.name} · {inr(pkg.rate)}/session · valid {pkg.validityDays}d</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.mint, fontFamily: font.mono, marginBottom: 12 }}>{inr(pkg.rate * pkg.sessions)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => togglePackage(pkg)} style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', fontSize: 11 }}>{pkg.active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => removePackage(pkg)} style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', fontSize: 11 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Card title="Payments" right={<div style={{ display: 'flex', gap: 6 }}>{['all', 'paid', 'created', 'failed'].map((f) => <button key={f} onClick={() => setFilter(f)} style={{ ...chip(filter === f), padding: '4px 10px', fontSize: 11 }}>{f === 'created' ? 'awaiting' : f}</button>)}</div>}>
        {visible.length === 0 ? <EmptyState title="No payments here" hint="Payments appear once a client books and pays, or buys a package." /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {['CLIENT', 'TYPE', 'AMOUNT', 'DATE', 'STATUS', ''].map((h, i) => <th key={i} style={S.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => (
                <tr key={p._id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                  <td style={{ ...S.td, fontSize: 13, fontWeight: 500, color: C.text2 }}>{p.client?.name || '—'}</td>
                  <td style={{ ...S.td, fontSize: 12, color: C.muted, textTransform: 'capitalize' }}>{p.kind}</td>
                  <td style={{ ...S.td, fontFamily: font.mono, fontSize: 13, color: C.text3 }}>{inr(p.amount)}</td>
                  <td style={{ ...S.td, fontFamily: font.mono, fontSize: 12, color: C.muted }}>{format(new Date(p.createdAt), 'd MMM')}</td>
                  <td style={S.td}><Badge bg={paymentStatus[p.status].bg} color={paymentStatus[p.status].text}>{p.status === 'created' ? 'awaiting' : p.status}</Badge></td>
                  <td style={S.td}>
                    {p.status === 'paid' && (
                      <a href={invoiceUrl(p._id)} target="_blank" rel="noreferrer" style={{ ...S.btnGhost, padding: '4px 10px', fontSize: 11, textDecoration: 'none', display: 'inline-flex' }}>Invoice</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {creatingPkg && <NewPackageModal onClose={() => setCreatingPkg(false)} onCreate={addPackage} />}
    </div>
  )
}
