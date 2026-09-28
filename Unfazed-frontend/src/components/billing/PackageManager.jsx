import { useEffect, useState } from 'react'
import { createPackage, deletePackage, listMyPackages, updatePackage } from '../../api/packages'

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const empty = { name: '', sessions: 6, rate: 2800, validityDays: 120 }

/** Therapist-side CRUD for packages. Add this to your Settings > Billing tab. */
export default function PackageManager() {
  const [packages, setPackages] = useState([])
  const [draft, setDraft] = useState(empty)
  const [loading, setLoading] = useState(true)

  const refresh = () => listMyPackages().then(setPackages).finally(() => setLoading(false))
  useEffect(() => { refresh() }, [])

  const add = async (e) => {
    e.preventDefault()
    await createPackage({ ...draft, sessions: Number(draft.sessions), rate: Number(draft.rate), validityDays: Number(draft.validityDays) })
    setDraft(empty)
    refresh()
  }

  const toggleActive = async (pkg) => { await updatePackage(pkg._id, { active: !pkg.active }); refresh() }
  const remove = async (pkg) => { if (confirm(`Delete "${pkg.name}"? This does not affect clients who already bought it.`)) { await deletePackage(pkg._id); refresh() } }

  if (loading) return <p>Loading packages…</p>

  return (
    <section>
      <h2>Session packages</h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8, marginBottom: 20 }}>
        {packages.map((pkg) => (
          <li key={pkg._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #d9e2df', borderRadius: 10, padding: 12, opacity: pkg.active ? 1 : 0.5 }}>
            <span><strong>{pkg.name}</strong> — {pkg.sessions} sessions at {formatINR(pkg.rate)}, valid {pkg.validityDays} days</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => toggleActive(pkg)}>{pkg.active ? 'Deactivate' : 'Activate'}</button>
              <button type="button" onClick={() => remove(pkg)}>Delete</button>
            </span>
          </li>
        ))}
        {packages.length === 0 && <p style={{ color: '#55645f' }}>No packages yet. Add one below.</p>}
      </ul>

      <form onSubmit={add} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 1fr) auto', alignItems: 'end' }}>
        <label>Name<input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
        <label>Sessions<input required type="number" min="1" value={draft.sessions} onChange={(e) => setDraft({ ...draft, sessions: e.target.value })} /></label>
        <label>Rate per session (₹)<input required type="number" min="0" value={draft.rate} onChange={(e) => setDraft({ ...draft, rate: e.target.value })} /></label>
        <label>Valid for (days)<input required type="number" min="1" value={draft.validityDays} onChange={(e) => setDraft({ ...draft, validityDays: e.target.value })} /></label>
        <button type="submit">Add package</button>
      </form>
    </section>
  )
}
