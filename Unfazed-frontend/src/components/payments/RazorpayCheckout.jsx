import { useState } from 'react'
import { loadRazorpayScript } from './loadRazorpay'
import { verifyPayment } from '../../api/payments'

/**
 * Reusable checkout trigger. Pass a function that creates the order on your backend
 * (createSessionOrder or createPackageOrder from api/payments.js), and this handles
 * loading the script, opening Razorpay Checkout, and verifying the result.
 *
 * Usage:
 *   <RazorpayCheckout
 *     createOrder={() => createSessionOrder(sessionId, amount)}
 *     therapistName={therapist.name}
 *     description="Individual therapy, 60 min"
 *     prefill={{ name, email, contact: phone }}
 *     onSuccess={(result) => navigate('/booked', { state: result })}
 *   >
 *     Pay ₹3,000
 *   </RazorpayCheckout>
 */
export default function RazorpayCheckout({ createOrder, therapistName, description, prefill, onSuccess, onDismiss, disabled, className, children }) {
  const [phase, setPhase] = useState('idle') // idle | loading | processing | error
  const [error, setError] = useState('')

  const start = async () => {
    setError('')
    setPhase('loading')
    try {
      await loadRazorpayScript()
      const order = await createOrder()

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: therapistName,
        description,
        prefill,
        theme: { color: '#1b6b58' },
        handler: async (response) => {
          setPhase('processing')
          try {
            const result = await verifyPayment({
              paymentId: order.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setPhase('idle')
            onSuccess?.({ ...result, paymentId: order.paymentId })
          } catch {
            setPhase('error')
            setError('Payment succeeded but we could not confirm it. Contact support with your payment ID before trying again.')
          }
        },
        modal: {
          ondismiss: () => { setPhase('idle'); onDismiss?.() },
        },
      })
      rzp.on('payment.failed', () => { setPhase('error'); setError('The payment did not go through. No amount was deducted; you can try again.') })
      rzp.open()
      setPhase('idle')
    } catch (err) {
      setPhase('error')
      setError(err.message || 'Something went wrong opening the payment window.')
    }
  }

  return (
    <div>
      <button type="button" onClick={start} disabled={disabled || phase === 'loading' || phase === 'processing'} className={className}>
        {phase === 'loading' ? 'Opening payment window' : phase === 'processing' ? 'Confirming payment' : children}
      </button>
      {error && <p role="alert" style={{ color: '#b3372b', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  )
}
