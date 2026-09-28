import { useEffect, useState } from 'react'

import { addDays, format } from 'date-fns'

import { getPublicSlots, publicBook } from '../../api/scheduling'
import { createSessionOrder } from '../../api/payments'

import { getErrorMessage } from '../../utils/errors'

import { Button, Field, Modal } from '../common/ui'
import RazorpayCheckout from '../payments/RazorpayCheckout'

import { C, S, chip, font } from '../common/theme'

const DAYS_AHEAD = 10

export default function BookingWidget({
  slug,
  defaultDuration,
  services = [],
  onBooked,
}) {
  const [dates] = useState(() =>
    Array.from(
      { length: DAYS_AHEAD },
      (_, i) => addDays(new Date(), i)
    )
  )

  const [dateIdx, setDateIdx] = useState(0)
  const [duration, setDuration] = useState(defaultDuration || 60)
  const [allowedDurations, setAllowedDurations] = useState([30, 45, 60, 90])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)

  const dateStr = format(dates[dateIdx], 'yyyy-MM-dd')

  const amount =
    services.find((service) => {
      const durationMinutes = parseInt(service.duration, 10)
      return durationMinutes === duration
    })?.price || null

  const loadSlots = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getPublicSlots(slug, dateStr, duration)

      setSlots(data.slots)
      setAllowedDurations(data.allowedDurations)
    } catch (err) {
      setError(getErrorMessage(err))
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [dateStr, duration])

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {allowedDurations.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDuration(d)}
            style={chip(duration === d)}
          >
            {d} min
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {dates.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setDateIdx(i)}
            style={{
              ...chip(dateIdx === i),
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 14px',
            }}
          >
            <span style={{ fontSize: 10 }}>
              {format(d, 'EEE')}
            </span>

            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {format(d, 'd')}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: C.dim }}>
          Loading available times...
        </div>
      ) : error ? (
        <div style={{ fontSize: 13, color: C.red }}>
          {error}
        </div>
      ) : slots.length === 0 ? (
        <div style={{ fontSize: 13, color: C.dim }}>
          No open slots on this day. Try another date.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(90px, 1fr))',
            gap: 8,
          }}
        >
          {slots.map((s) => (
            <button
              key={s.start}
              type="button"
              onClick={() => setSelectedSlot(s)}
              style={{
                padding: '10px 8px',
                borderRadius: 8,
                border: `1px solid ${C.line}`,
                background: C.card,
                color: C.text2,
                fontSize: 13,
                fontFamily: font.mono,
                cursor: 'pointer',
              }}
            >
              {new Date(s.start).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </button>
          ))}
        </div>
      )}

      {selectedSlot && (
        <ConfirmBookingModal
          slug={slug}
          slot={selectedSlot}
          duration={duration}
          amount={amount}
          onClose={() => setSelectedSlot(null)}
          onSuccess={(result) => {
            setSelectedSlot(null)
            onBooked(result)
          }}
          onSlotTaken={() => {
            setSelectedSlot(null)
            loadSlots()
          }}
        />
      )}
    </>
  )
}

function ConfirmBookingModal({
  slug,
  slot,
  duration,
  amount,
  onClose,
  onSuccess,
  onSlotTaken,
}) {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const [booking, setBooking] = useState(null)

  const set = (key) => (e) => {
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }))
  }

  const validate = () => {
    const e = {}

    if (!form.clientName.trim()) {
      e.clientName = 'Enter your name'
    }

    if (!/^\S+@\S+\.\S+$/.test(form.clientEmail)) {
      e.clientEmail = 'Enter a valid email'
    }

    setErrors(e)

    return Object.keys(e).length === 0
  }

  
  const submit = async (ev) => {
    ev.preventDefault()

    if (!validate()) return

    if (!amount) {
      setServerError(
        'Payment amount is not configured for this session.'
      )
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      const result = await publicBook(slug, {
        start: slot.start,
        durationMinutes: duration,
        ...form,
      })

      
      setBooking(result)
    } catch (err) {
      if (err.response?.status === 409) {
        onSlotTaken()
      } else {
        setServerError(getErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  
  const createOrder = () => {
    if (!booking?.session?._id) {
      throw new Error(
        'Session was not created. Please try again.'
      )
    }

    return createSessionOrder(
      booking.session._id,
      amount
    )
  }

  return (
    <Modal
      title="Confirm your session"
      onClose={onClose}
    >
      <div
        style={{
          fontSize: 13,
          color: C.muted,
          marginBottom: 16,
        }}
      >
        {new Date(slot.start).toLocaleDateString([], {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}{' '}
        at{' '}
        {new Date(slot.start).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        · {duration} min
      </div>

      <form
        onSubmit={submit}
        noValidate
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Field
          label="YOUR NAME"
          error={errors.clientName}
        >
          <input
            style={S.input}
            value={form.clientName}
            onChange={set('clientName')}
            disabled={!!booking}
          />
        </Field>

        <Field
          label="EMAIL"
          error={errors.clientEmail}
        >
          <input
            type="email"
            style={S.input}
            value={form.clientEmail}
            onChange={set('clientEmail')}
            disabled={!!booking}
          />
        </Field>

        <Field label="PHONE (OPTIONAL)">
          <input
            style={S.input}
            value={form.clientPhone}
            onChange={set('clientPhone')}
            disabled={!!booking}
          />
        </Field>

        {serverError && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: C.red,
            }}
          >
            {serverError}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          {!booking ? (
            
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Creating booking...'
                : `Continue to payment · ₹${amount}`}
            </Button>
          ) : (
            
            <RazorpayCheckout
              createOrder={createOrder}
              therapistName="Therapy Session"
              description={`${duration} minute therapy session`}
              prefill={{
                name: form.clientName,
                email: form.clientEmail,
                contact: form.clientPhone,
              }}
              onSuccess={(paymentResult) => {
                
                onSuccess({
                  ...booking,
                  payment: paymentResult,
                })
              }}
              onDismiss={() => {
                
              }}
            >
              Pay ₹{amount}
            </RazorpayCheckout>
          )}
        </div>
      </form>
    </Modal>
  )
}