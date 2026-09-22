import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { initials, publicLink } from '../../utils/format'
import { plans } from '../../data/mock'
import { inr } from '../../utils/format'
import { Button, Card, Field } from '../../components/common/ui'
import TagInput from '../../components/common/TagInput'
import { C, S, chip, font } from '../../components/common/theme'

// Keep in sync with RESERVED in backend utils/generateSlug.js
const RESERVED = ['login', 'register', 'dashboard', 'api', 'admin', 'settings']
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

export default function Settings() {
  const { therapist, updateProfile } = useAuth()
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

  // Local only until Module 2 saves availability to the API
  const [duration, setDuration] = useState('60')
  const [buffer, setBuffer] = useState('10')
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])

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
        <div style={{ fontSize: 11, color: C.dim }}>These settings are saved to the server when the scheduling module is added.</div>
        <Field label="DEFAULT SESSION DURATION">
          <div style={{ display: 'flex', gap: 8 }}>{['30', '45', '60', '90'].map((d) => <button key={d} onClick={() => setDuration(d)} style={chip(duration === d)}>{d} min</button>)}</div>
        </Field>
        <Field label="BUFFER BETWEEN SESSIONS">
          <div style={{ display: 'flex', gap: 8 }}>{['0', '5', '10', '15'].map((d) => <button key={d} onClick={() => setBuffer(d)} style={chip(buffer === d)}>{d} min</button>)}</div>
        </Field>
        <Field label="WORKING DAYS">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <button key={d} onClick={() => toggleDay(d)} aria-pressed={days.includes(d)} style={chip(days.includes(d))}>{d}</button>)}</div>
        </Field>
      </Card>

      <Card title="Subscription" right={<span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(45,143,106,0.2)', color: C.mint, borderRadius: 20, fontFamily: font.mono }}>PRO ACTIVE</span>} style={{ borderColor: 'rgba(45,143,106,0.3)' }} bodyStyle={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {plans.map((plan) => {
          const active = plan.tier === 'Pro'
          return (
            <div key={plan.tier} style={{ padding: 16, borderRadius: 8, border: `1px solid ${active ? C.green : C.line}`, background: active ? 'rgba(45,143,106,0.08)' : 'transparent' }}>
              <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text, marginBottom: 4 }}>{plan.tier}</div>
              <div style={{ fontFamily: font.mono, fontSize: 20, color: active ? C.mint : C.text3, marginBottom: 4 }}>{inr(plan.price)}<span style={{ fontSize: 11, color: C.muted }}>/mo</span></div>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>{plan.clients}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {plan.features.map((f) => <div key={f} style={{ fontSize: 11, color: C.muted }}><span style={{ color: active ? C.mint : C.faint }}>✓</span> {f}</div>)}
              </div>
              {!active && <button onClick={() => toast.info('Plan changes arrive with Module 7')} style={{ ...S.btnGhost, marginTop: 12, width: '100%', justifyContent: 'center', borderColor: C.green, color: C.mint }}>Switch plan</button>}
            </div>
          )
        })}
      </Card>
    </div>
  )
}
