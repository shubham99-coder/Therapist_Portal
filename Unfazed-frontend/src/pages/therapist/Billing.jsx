import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { useToast } from '../../context/ToastContext'
import { initialClients, initialInvoices, packages } from '../../data/mock'
import { inr } from '../../utils/format'
import { Badge, Button, Card, EmptyState, Field, Modal, PageHeader, StatCard } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

const invStatus = {
  paid: { bg: 'rgba(45,143,106,0.15)', text: C.mint },
  pending: { bg: 'rgba(240,169,110,0.15)', text: C.amber },
  overdue: { bg: 'rgba(239,68,68,0.15)', text: C.red },
}

function NewInvoiceModal({ onClose, onCreate, presetClient }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { client: presetClient || initialClients[0].name, type: 'Per session', amount: 3000 },
  })
  return (
    <Modal title="New invoice" onClose={onClose}>
      <form onSubmit={handleSubmit(onCreate)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="CLIENT">
          <select style={S.input} {...register('client')}>{initialClients.map((c) => <option key={c.id}>{c.name}</option>)}</select>
        </Field>
        <Field label="TYPE">
          <select style={S.input} {...register('type')}>
            <option>Per session</option>
            {packages.map((p) => <option key={p.sessions}>{p.sessions}-session pkg</option>)}
          </select>
        </Field>
        <Field label="AMOUNT (₹)" error={errors.amount?.message}>
          <input type="number" style={S.input} {...register('amount', { required: 'Enter an amount', min: { value: 1, message: 'Amount must be above zero' } })} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create invoice</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Billing() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [presetClient, setPresetClient] = useState('')

  useEffect(() => {
    if (location.state?.openNew) {
      setPresetClient(location.state.client || '')
      setCreating(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const sum = (status) => invoices.filter((i) => i.status === status).reduce((t, i) => t + i.amount, 0)
  const count = (status) => invoices.filter((i) => i.status === status).length
  const visible = useMemo(() => invoices.filter((i) => filter === 'all' || i.status === filter), [invoices, filter])

  const markPaid = (id) => {
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, status: 'paid' } : i)))
    toast.success('Invoice marked as paid')
  }

  const createInvoice = (data) => {
    const next = Math.max(...invoices.map((i) => Number(i.id.split('-')[1]))) + 1
    setInvoices((list) => [{ id: `INV-${next}`, client: data.client, type: data.type, amount: Number(data.amount), date: format(new Date(), 'd MMM'), status: 'pending' }, ...list])
    setCreating(false)
    toast.success(`Invoice INV-${next} created`)
  }

  return (
    <div style={S.page}>
      <PageHeader eyebrow="PAYMENTS & PACKAGES" title="Billing" action={<Button onClick={() => { setPresetClient(''); setCreating(true) }}>+ New invoice</Button>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="COLLECTED" value={inr(sum('paid'))} sub={`from ${count('paid')} invoices`} />
        <StatCard label="PENDING" value={inr(sum('pending'))} sub={`${count('pending')} invoices awaiting payment`} tone="warn" />
        <StatCard label="OVERDUE" value={inr(sum('overdue'))} sub={`${count('overdue')} invoice past due`} tone="danger" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 14, fontFamily: font.mono, letterSpacing: '0.06em' }}>SESSION PACKAGES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {packages.map((pkg) => (
            <div key={pkg.sessions} style={{ background: pkg.popular ? 'rgba(45,143,106,0.12)' : C.card, border: `1px solid ${pkg.popular ? C.green : C.line}`, borderRadius: 10, padding: '16px 20px', position: 'relative' }}>
              {pkg.popular && <span style={{ position: 'absolute', top: -1, right: 16, transform: 'translateY(-50%)', background: C.green, color: '#fff', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontFamily: font.mono }}>POPULAR</span>}
              <div style={{ fontFamily: font.serif, fontSize: 22, color: C.text, marginBottom: 4 }}>{pkg.sessions} sessions</div>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>{pkg.label} · {inr(pkg.rate)}/session</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.mint, fontFamily: font.mono }}>{inr(pkg.sessions * pkg.rate)}</div>
            </div>
          ))}
        </div>
      </div>

      <Card title="Invoices" right={<div style={{ display: 'flex', gap: 6 }}>{['all', 'paid', 'pending', 'overdue'].map((f) => <button key={f} onClick={() => setFilter(f)} style={{ ...chip(filter === f), padding: '4px 10px', fontSize: 11 }}>{f}</button>)}</div>}>
        {visible.length === 0 ? <EmptyState title="No invoices here" hint="Change the filter or create a new invoice." /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {['INVOICE', 'CLIENT', 'TYPE', 'AMOUNT', 'DATE', 'STATUS', ''].map((h, i) => <th key={i} style={S.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map((inv, i) => (
                <tr key={inv.id} style={{ borderBottom: i < visible.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                  <td style={{ ...S.td, fontFamily: font.mono, fontSize: 12, color: C.muted }}>{inv.id}</td>
                  <td style={{ ...S.td, fontSize: 13, fontWeight: 500, color: C.text2 }}>{inv.client}</td>
                  <td style={{ ...S.td, fontSize: 12, color: C.muted }}>{inv.type}</td>
                  <td style={{ ...S.td, fontFamily: font.mono, fontSize: 13, color: C.text3 }}>{inr(inv.amount)}</td>
                  <td style={{ ...S.td, fontFamily: font.mono, fontSize: 12, color: C.muted }}>{inv.date}</td>
                  <td style={S.td}><Badge bg={invStatus[inv.status].bg} color={invStatus[inv.status].text}>{inv.status}</Badge></td>
                  <td style={{ ...S.td, display: 'flex', gap: 6 }}>
                    {inv.status !== 'paid' && <button onClick={() => markPaid(inv.id)} style={{ ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}>Mark paid</button>}
                    <button onClick={() => toast.info('PDF invoices arrive with Module 4')} style={{ ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}>PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {creating && <NewInvoiceModal presetClient={presetClient} onClose={() => setCreating(false)} onCreate={createInvoice} />}
    </div>
  )
}
