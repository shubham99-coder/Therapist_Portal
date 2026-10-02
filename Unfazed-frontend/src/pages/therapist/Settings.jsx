import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { initials, publicLink } from '../../utils/format'
import { useEntitlement } from '../../hooks/useEntitlement'
import { getAvailability, updateAvailability } from '../../api/scheduling'
import { Button, Card, Field } from '../../components/common/ui'
import TagInput from '../../components/common/TagInput'
import { C, S, chip, font } from '../../components/common/theme'

// Keep in sync with RESERVED in backend utils/generateSlug.js
const RESERVED = ['login', 'register', 'dashboard', 'api', 'admin', 'settings']
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

export default function Settings() {
  const { therapist, updateProfile } = useAuth()
  const { subscription, plans } = useEntitlement()
  const toast = useToast()

  const [form, setForm] = useState({
    name: therapist.name || '',
    slug: therapist.slug || '',
    bio: therapist.bio || '',
    photoUrl: therapist.photoUrl || '',
    specializations: therapist.specializations || [],
    languages: therapist.languages || [],
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [duration, setDuration] = useState('60')
  const [buffer, setBuffer] = useState('10')
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [minNoticeHours, setMinNoticeHours] = useState('12')
  const [bookingWindowDays, setBookingWindowDays] = useState('30')
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAvailability()
      .then((a) => {
        if (cancelled || !a) return
        setDuration(String(a.defaultDuration ?? 60))
        setBuffer(String(a.bufferMinutes ?? 10))
        setTimezone(a.timezone || 'Asia/Kolkata')
        setMinNoticeHours(String(a.minNoticeHours ?? 12))
        setBookingWindowDays(String(a.bookingWindowDays ?? 30))
        const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const openDays = (a.weeklyTemplate || [])
          .filter((d) => d.isOpen)
          .map((d) => labels[d.weekday])
          .filter(Boolean)
        setDays(openDays)
        const firstWindow = (a.weeklyTemplate || []).find((d) => d.isOpen && d.windows?.length)?.windows?.[0]
        if (firstWindow) {
          setStartTime(firstWindow.start || '09:00')
          setEndTime(firstWindow.end || '17:00')
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => { if (!cancelled) setAvailabilityLoading(false) })
    return () => { cancelled = true }
  }, [toast])

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const onText = (key) => (e) => set(key)(e.target.value)

  const dirty =
    form.name !== therapist.name || form.slug !== therapist.slug || form.bio !== (therapist.bio || '') ||
    form.photoUrl !== (therapist.photoUrl || '') ||
    !sameList(form.specializations, therapist.specializations || []) ||
    !sameList(form.languages, therapist.languages || [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Enter your name'
    if (!form.slug) e.slug = 'Choose a link'
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) e.slug = 'Use lowercase letters, numbers and single hyphens'
    else if (RESERVED.includes(form.slug)) e.slug = 'That link is reserved. Choose another.'
    if (form.photoUrl && !/^https?:\/\//.test(form.photoUrl)) e.photoUrl = 'Enter a full image URL starting with https://'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await updateProfile({ ...form, name: form.name.trim(), slug: form.slug.trim().toLowerCase() })
      toast.success('Profile saved')
    } catch (err) {
      const message = getErrorMessage(err)
      if (err.response?.status === 409) setErrors({ slug: message })
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const reset = () => { setForm({ name: therapist.name, slug: therapist.slug, bio: therapist.bio || '', photoUrl: therapist.photoUrl || '', specializations: therapist.specializations || [], languages: therapist.languages || [] }); setErrors({}) }

  const saveAvailability = async () => {
    setAvailabilitySaving(true)
    try {
      const dayNumber = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
      const open = new Set(days)
      const weeklyTemplate = Object.entries(dayNumber).map(([label, weekday]) => ({
        weekday,
        isOpen: open.has(label),
        windows: open.has(label) ? [{ start: startTime, end: endTime }] : [],
      }))
      const allowedDurations = [30, 45, 60, 90].filter((value) => value === Number(duration) || [30, 45, 60, 90].includes(value))
      await updateAvailability({
        timezone,
        weeklyTemplate,
        bufferMinutes: Number(buffer),
        allowedDurations,
        defaultDuration: Number(duration),
        minNoticeHours: Number(minNoticeHours),
        bookingWindowDays: Number(bookingWindowDays),
      })
      toast.success('Availability saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAvailabilitySaving(false)
    }
  }

  const toggleDay = (d) => setDays((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]))

  return (
    <div style={{ ...S.page, maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={S.eyebrow}>PRACTICE SETTINGS</div>
        <h1 style={S.h1}>Settings</h1>
      </div>

      <Card title="Public profile" style={{ marginBottom: 20 }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {form.photoUrl ? (
            <img src={form.photoUrl} alt="Profile preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(45,143,106,0.25)', color: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.serif, fontSize: 22 }}>{initials(form.name)}</div>
          )}
          <div style={{ flex: 1 }}>
            <Field label="PHOTO URL" error={errors.photoUrl}>
              <input style={S.input} value={form.photoUrl} onChange={onText('photoUrl')} placeholder="https://..." />
            </Field>
          </div>
        </div>

        <Field label="FULL NAME" error={errors.name}>
          <input style={S.input} value={form.name} onChange={onText('name')} />
        </Field>

        <Field label="BRANDED LINK" error={errors.slug}>
          <div style={{ display: 'flex', alignItems: 'center', background: C.side, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden' }}>
            <span style={{ padding: '10px 12px', fontSize: 13, color: C.faint, borderRight: `1px solid ${C.line}`, whiteSpace: 'nowrap' }}>unfazed.in/</span>
            <input value={form.slug} onChange={(e) => set('slug')(e.target.value.toLowerCase().trim())} style={{ flex: 1, padding: '10px 12px', background: 'transparent', border: 'none', color: C.text2, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>Preview: {publicLink(form.slug || 'your-link')}. Changing it breaks links you already shared.</div>
        </Field>

        <Field label="BIO">
          <textarea rows={4} value={form.bio} onChange={onText('bio')} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />
        </Field>

        <Field label="SPECIALIZATIONS"><TagInput values={form.specializations} onChange={set('specializations')} /></Field>
        <Field label="LANGUAGES"><TagInput values={form.languages} onChange={set('languages')} placeholder="Add a language" /></Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={reset} disabled={!dirty}>Discard</Button>
          <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </Card>

      <Card title="Availability" style={{ marginBottom: 20 }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 11, color: C.dim }}>
          These settings are saved to your scheduling availability and are used by the public booking page.
        </div>

        <Field label="TIMEZONE">
          <select style={S.input} value={timezone} onChange={(e) => setTimezone(e.target.value)} disabled={availabilityLoading}>
            {['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'UTC'].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </Field>

        <Field label="DEFAULT SESSION DURATION">
          <div style={{ display: 'flex', gap: 8 }}>{['30', '45', '60', '90'].map((d) => <button type="button" key={d} onClick={() => setDuration(d)} style={chip(duration === d)}>{d} min</button>)}</div>
        </Field>

        <Field label="BUFFER BETWEEN SESSIONS">
          <div style={{ display: 'flex', gap: 8 }}>{['0', '5', '10', '15'].map((d) => <button type="button" key={d} onClick={() => setBuffer(d)} style={chip(buffer === d)}>{d} min</button>)}</div>
        </Field>

        <Field label="WORKING DAYS">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <button type="button" key={d} onClick={() => toggleDay(d)} aria-pressed={days.includes(d)} style={chip(days.includes(d))}>{d}</button>)}</div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="START TIME">
            <input type="time" style={S.input} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </Field>
          <Field label="END TIME">
            <input type="time" style={S.input} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="MINIMUM NOTICE (HOURS)">
            <input type="number" min="0" style={S.input} value={minNoticeHours} onChange={(e) => setMinNoticeHours(e.target.value)} />
          </Field>
          <Field label="BOOKING WINDOW (DAYS)">
            <input type="number" min="1" style={S.input} value={bookingWindowDays} onChange={(e) => setBookingWindowDays(e.target.value)} />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={saveAvailability} disabled={availabilityLoading || availabilitySaving}>
            {availabilitySaving ? 'Saving...' : 'Save availability'}
          </Button>
        </div>
      </Card>

      <Card
        title="Subscription & entitlements"
        right={subscription ? (
          <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(45,143,106,0.2)', color: C.mint, borderRadius: 20, fontFamily: font.mono }}>
            {subscription.name.toUpperCase()}
          </span>
        ) : null}
        style={{ borderColor: 'rgba(45,143,106,0.3)' }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 18, lineHeight: 1.6 }}>
          Subscription limits and feature access are loaded from the backend SubscriptionTierConfig collection.
          The client-facing UI is only a display layer; the API enforces the same entitlements.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {plans.map((plan) => {
            const active = plan.tier === subscription?.tier
            return (
              <div key={plan.tier} style={{ padding: 16, borderRadius: 8, border: `1px solid ${active ? C.green : C.line}`, background: active ? 'rgba(45,143,106,0.08)' : 'transparent' }}>
                <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>{plan.description}</div>
                <div style={{ fontSize: 11, color: C.text3, marginBottom: 8 }}>
                  Up to {plan.caps?.activeClients ?? '—'} active clients
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ fontSize: 11, color: plan.features?.noteTemplates ? C.muted : C.faint }}>
                    <span style={{ color: plan.features?.noteTemplates ? C.mint : C.faint }}>{plan.features?.noteTemplates ? '✓' : '—'}</span> Structured note templates
                  </div>
                  <div style={{ fontSize: 11, color: plan.features?.advancedAnalytics ? C.muted : C.faint }}>
                    <span style={{ color: plan.features?.advancedAnalytics ? C.mint : C.faint }}>{plan.features?.advancedAnalytics ? '✓' : '—'}</span> Advanced analytics
                  </div>
                </div>
                {active && (
                  <div style={{ marginTop: 12, fontSize: 10, color: C.mint, fontFamily: font.mono }}>CURRENT PLAN</div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
