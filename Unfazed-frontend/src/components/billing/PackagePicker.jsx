import { useEffect, useState } from 'react'
import { listPublicPackages } from '../../api/packages'
import { createPackageOrder } from '../../api/payments'
import RazorpayCheckout from '../payments/RazorpayCheckout'

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

/**
 * Shown on the public booking page or client portal so a client can buy a
 * session bundle. Drop this in wherever your BookingWidget/PublicProfile
 * shows the single-session price list.
 */
export default function PackagePicker({ slug, therapistName, clientId, onPurchased }) {
  const [packages, setPackages] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | empty | error

  useEffect(() => {
    let cancelled = false
    listPublicPackages(slug)
      .then((data) => { if (!cancelled) { setPackages(data); setStatus(data.length ? 'ready' : 'empty') } })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [slug])

  if (status === 'loading') return <p>Loading packages…</p>
  if (status === 'error') return <p>Could not load packages right now.</p>
  if (status === 'empty') return null // no packages configured — fine, just don't show the section

  return (
    <section>
      <h2>Session packages</h2>
      <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
        {packages.map((pkg) => (
          <li key={pkg._id} style={{ border: '1px solid #d9e2df', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong>{pkg.name}, {pkg.sessions} sessions</strong>
              <span>{formatINR(pkg.rate)} / session</span>
            </div>
            <p style={{ color: '#55645f', fontSize: 13, margin: '4px 0 12px' }}>Valid {pkg.validityDays} days from purchase</p>
            <RazorpayCheckout
              createOrder={() => createPackageOrder(pkg._id, clientId)}
              therapistName={therapistName}
              description={`${pkg.name}, ${pkg.sessions} sessions`}
              onSuccess={(result) => onPurchased?.(result, pkg)}
            >
              Buy for {formatINR(pkg.rate * pkg.sessions)}
            </RazorpayCheckout>
          </li>
        ))}
      </ul>
    </section>
  )
}
