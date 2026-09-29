import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getIntakeRecord, submitIntake } from '../../api/clients'
import { getErrorMessage } from '../../utils/errors'
import { Button, Field, Spinner } from '../../components/common/ui'
import { C, S, font } from '../../components/common/theme'
import NotFound from './NotFound'

export default function IntakeForm() {
  const { slug, clientId } = useParams()
  const [status, setStatus] = useState('loading')
  const [client, setClient] = useState(null)
  const [form, setForm] = useState({ presentingConcern: '', history: '', occupation: '', emergencyContact: '', consent: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getIntakeRecord(clientId)
      .then((c) => {
        setClient(c)
        if (c.intake?.submittedAt) {
          setForm({
            presentingConcern: c.intake.presentingConcern || '', history: c.intake.history || '',
            occupation: c.intake.occupation || '', emergencyContact: c.intake.emergencyContact || '', consent: true,
          })
        }
        setStatus('ready')
      })
      .catch((err) => setStatus(err.response?.status === 404 ? 'missing' : 'error'))
  }, [clientId])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.presentingConcern.trim()) e.presentingConcern = 'Tell us briefly what brings you here'
    if (!form.consent) e.consent = 'You need to accept before submitting'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitIntake(clientId, form)
      setSubmitted(true)
    } catch (err) {
      setErrors({ form: getErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return <Spinner />
  if (status === 'missing') return <NotFound message="We couldn't find this intake form. Check the link your therapist sent you." />
  if (status === 'error') return <NotFound message="Something went wrong loading this form. Try again in a moment." />

  const alreadyDone = submitted || !!client?.intake?.submittedAt

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex', justifyContent: 'center', padding: '48px 20px' }}>
      <div style={{ width: 520, maxWidth: '100%' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={S.eyebrow}>BEFORE YOUR FIRST SESSION</div>
          <h1 style={{ ...S.h1, fontSize: 26 }}>Intake form</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
            Hi {client?.name}, this helps your therapist prepare. It takes about two minutes.
          </p>
        </div>

        {alreadyDone ? (
          <div style={{ ...S.card, padding: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text2, marginBottom: 8 }}>Thanks — this is already on file</div>
            <p style={{ fontSize: 13, color: C.muted }}>Your therapist has received your intake information and consent.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to={`/client/${clientId}/notes`} style={{ color: C.mint, fontSize: 13 }}>View shared notes</Link>
              <Link to={`/${slug}`} style={{ color: C.dim, fontSize: 13 }}>Back to the practice page</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate style={{ ...S.card, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="WHAT BRINGS YOU HERE?" error={errors.presentingConcern}>
              <textarea rows={3} style={{ ...S.input, resize: 'vertical' }} value={form.presentingConcern} onChange={set('presentingConcern')} placeholder="A few sentences is plenty." />
            </Field>
            <Field label="RELEVANT HISTORY (OPTIONAL)">
              <textarea rows={3} style={{ ...S.input, resize: 'vertical' }} value={form.history} onChange={set('history')} placeholder="Past therapy, medication, diagnoses, whatever feels relevant." />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="OCCUPATION (OPTIONAL)">
                <input style={S.input} value={form.occupation} onChange={set('occupation')} />
              </Field>
              <Field label="EMERGENCY CONTACT (OPTIONAL)">
                <input style={S.input} value={form.emergencyContact} onChange={set('emergencyContact')} placeholder="Name and phone" />
              </Field>
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: C.muted, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))} style={{ marginTop: 2 }} />
              <span>I consent to sharing this information with my therapist for the purpose of my care, and understand session notes marked private are never shared with me.</span>
            </label>
            {errors.consent && <div role="alert" style={{ fontSize: 11, color: C.red, marginTop: -12 }}>{errors.consent}</div>}
            {errors.form && <div role="alert" style={{ fontSize: 12, color: C.red }}>{errors.form}</div>}

            <Button type="submit" disabled={submitting} style={{ padding: '11px 16px', fontSize: 13 }}>
              {submitting ? 'Submitting...' : 'Submit intake form'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
