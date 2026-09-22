import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axiosInstance'
import { useToast } from '../../context/ToastContext'
import { services } from '../../data/services'
import { inr, initials, publicLink } from '../../utils/format'
import { Spinner } from '../../components/common/ui'
import { C, font } from '../../components/common/theme'
import NotFound from './NotFound'

function setMeta(property, content) {
  let el = document.head.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function PublicProfile() {
  const { slug } = useParams()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    api.get(`/therapists/public/${slug}`)
      .then((res) => { if (!cancelled) { setProfile(res.data); setStatus('ready') } })
      .catch((err) => { if (!cancelled) setStatus(err.response?.status === 404 ? 'missing' : 'error') })
    return () => { cancelled = true }
  }, [slug])

  // Basic Open Graph tags. Crawlers that skip JavaScript need a server-rendered
  // version of these; see the note in the setup guide.
  useEffect(() => {
    if (!profile) return
    const title = `${profile.name} on Unfazed`
    const description = profile.bio || `Book a session with ${profile.name}.`
    document.title = title
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:type', 'profile')
    setMeta('og:url', publicLink(profile.slug))
    if (profile.photoUrl) setMeta('og:image', profile.photoUrl)
    return () => { document.title = 'Unfazed' }
  }, [profile])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink(profile.slug))
      toast.success('Link copied')
    } catch {
      toast.error('Could not copy the link')
    }
  }

  if (status === 'loading') return <Spinner />
  if (status === 'missing') return <NotFound message="No therapist uses this link. Check the spelling and try again." />
  if (status === 'error') return <NotFound message="We could not load this profile. Try again in a moment." />

  const book = (service) => toast.info(`Booking for "${service.title}" opens with the scheduling module.`)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px 40px' }}>
        {/* Hero */}
        <header style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.line}` }} />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(45,143,106,0.2)', color: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.serif, fontSize: 40 }}>
              {initials(profile.name)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ fontFamily: font.serif, fontSize: 44, lineHeight: 1.05, margin: 0, letterSpacing: '-0.02em' }}>{profile.name}</h1>
            {profile.languages?.length > 0 && (
              <div style={{ fontSize: 13, color: C.muted, marginTop: 10 }}>Sessions in {profile.languages.join(', ')}</div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button onClick={() => book(services[0])} style={{ padding: '11px 22px', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Book a session</button>
              <button onClick={copyLink} style={{ padding: '11px 18px', background: 'transparent', border: `1px solid ${C.line}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: 'pointer' }}>Copy link</button>
            </div>
          </div>
        </header>

        {/* About */}
        <section style={{ marginBottom: 44 }}>
          <h2 style={{ fontFamily: font.serif, fontSize: 24, margin: '0 0 12px' }}>About</h2>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text3, maxWidth: 640, margin: 0 }}>
            {profile.bio || `${profile.name} has not added a bio yet.`}
          </p>
        </section>

        {/* Specializations */}
        {profile.specializations?.length > 0 && (
          <section style={{ marginBottom: 44 }}>
            <h2 style={{ fontFamily: font.serif, fontSize: 24, margin: '0 0 12px' }}>Areas of work</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.specializations.map((s) => (
                <span key={s} style={{ padding: '6px 14px', background: 'rgba(45,143,106,0.15)', border: '1px solid rgba(45,143,106,0.25)', borderRadius: 20, fontSize: 13, color: C.mint }}>{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontFamily: font.serif, fontSize: 24, margin: '0 0 16px' }}>Sessions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {services.map((s) => (
              <div key={s.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: font.serif, fontSize: 20, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 10 }}>{s.duration}</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>{s.blurb}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: font.mono, fontSize: 16, color: C.mint }}>{inr(s.price)}</span>
                  <button onClick={() => book(s)} style={{ padding: '7px 14px', background: 'transparent', border: `1px solid ${C.green}`, borderRadius: 7, color: C.mint, fontSize: 12, cursor: 'pointer' }}>Book</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${C.line}`, paddingTop: 20, fontSize: 12, color: C.faint, display: 'flex', justifyContent: 'space-between' }}>
          <span>Practice page by Unfazed</span>
          <Link to="/login" style={{ color: C.dim }}>Therapist log in</Link>
        </footer>
      </div>
    </div>
  )
}
