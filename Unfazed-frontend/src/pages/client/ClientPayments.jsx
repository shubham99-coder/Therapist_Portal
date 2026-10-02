import { useEffect, useState } from 'react'
import { createClientPackageOrder, createClientSessionOrder, getClientPackages, getClientPayments, getClientSessions, downloadClientInvoice } from '../../api/clientPortal'
import RazorpayCheckout from '../../components/payments/RazorpayCheckout'
import { C, S, font } from '../../components/common/theme'
import { Card, Spinner } from '../../components/common/ui'
import { useClientAuth } from '../../context/ClientAuthContext'
import { getErrorMessage } from '../../utils/errors'

export default function ClientPayments() {
  const { client, therapist } = useClientAuth()
  const [payments, setPayments] = useState(null)
  const [packages, setPackages] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState('')

  const reload = async () => {
    try {
      const [p, g, s] = await Promise.all([getClientPayments(), getClientPackages(), getClientSessions()])
      setPayments(p.payments || [])
      setPackages(g)
      setSessions(s.sessions || [])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  useEffect(() => { reload() }, [])

  if (!payments || !packages || !sessions) return <Spinner label="Loading payments" />

  const pendingSessions = sessions.filter((s) => s.status === 'pending' && Number(s.amount) > 0)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={S.eyebrow}>CLIENT PORTAL</div>
        <h1 style={S.h1}>Payments & packages</h1>
        <p style={{ color: C.muted, fontSize: 13 }}>Manage session payments, packages and invoices.</p>
      </div>

      {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {pendingSessions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Card title="Payment required" bodyStyle={{ padding: 0 }}>
            {pendingSessions.map((session) => (
              <div key={session._id} style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Upcoming therapy session</div>
                  <div style={{ marginTop: 4, fontSize: 10, color: C.muted }}>{new Date(session.start).toLocaleString()} · {session.durationMinutes} min</div>
                </div>
                <RazorpayCheckout
                  createOrder={() => createClientSessionOrder(session._id)}
                  therapistName={therapist?.name}
                  description={`${session.durationMinutes} minute therapy session`}
                  prefill={{ name: client?.name, email: client?.email, contact: client?.phone }}
                  onSuccess={reload}
                >
                  Pay ₹{Number(session.amount).toLocaleString('en-IN')}
                </RazorpayCheckout>
              </div>
            ))}
          </Card>
        </div>
      )}

      <Card title="Available packages" bodyStyle={{ padding: 0 }}>
        {packages.available.length ? packages.available.map((pkg) => (
          <div key={pkg._id} style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{pkg.name}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{pkg.sessions} sessions · ₹{Number(pkg.rate).toLocaleString('en-IN')} per session · {pkg.validityDays} days</div>
            </div>
            <RazorpayCheckout
              createOrder={() => createClientPackageOrder(pkg._id)}
              therapistName={therapist?.name}
              description={`${pkg.name} package`}
              prefill={{ name: client?.name, email: client?.email, contact: client?.phone }}
              onSuccess={reload}
            >
              Buy · ₹{Number(pkg.rate * pkg.sessions).toLocaleString('en-IN')}
            </RazorpayCheckout>
          </div>
        )) : <div style={{ padding: 18, color: C.dim, fontSize: 12 }}>No packages are currently available.</div>}
      </Card>

      <div style={{ height: 16 }} />

      <Card title="Payment history" bodyStyle={{ padding: 0 }}>
        {payments.length ? payments.map((p) => (
          <div key={p._id} style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', gap: 15, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{p.kind === 'package' ? 'Session package' : 'Therapy session'}</div>
              <div style={{ fontSize: 10, color: C.dim }}>{new Date(p.createdAt).toLocaleDateString()} · {p.status}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: font.mono, color: p.status === 'paid' ? C.mint : C.amber, fontSize: 12 }}>₹{Number(p.amount).toLocaleString('en-IN')}</div>
              {p.status === 'paid' && p.invoiceNumber && <button type="button" onClick={() => downloadClientInvoice(p._id)} style={{ background:'transparent',border:0,padding:0,fontSize:9,color:C.mint,cursor:'pointer' }}>Invoice {p.invoiceNumber}</button>}
            </div>
          </div>
        )) : <div style={{ padding: 18, color: C.dim, fontSize: 12 }}>No payments yet.</div>}
      </Card>

      <div style={{ height: 16 }} />

      <Card title="Purchased packages" bodyStyle={{ padding: 0 }}>
        {packages.owned.length ? packages.owned.map((cp) => (
          <div key={cp._id} style={{ padding: 16, borderBottom: `1px solid ${C.line}` }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{cp.package?.name || 'Package'}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{cp.sessionsUsed} used / {cp.sessionsTotal} total · expires {new Date(cp.expiresAt).toLocaleDateString()} · {cp.status}</div>
          </div>
        )) : <div style={{ padding: 18, color: C.dim, fontSize: 12 }}>No purchased packages.</div>}
      </Card>
    </div>
  )
}
