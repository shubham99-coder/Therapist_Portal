// Loads the Razorpay Checkout script once, even if it wasn't added to index.html.
// Prefer adding <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// to index.html directly — this is just a safety net so Checkout still works either way.
let loading = null

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'))
    document.body.appendChild(script)
  })
  return loading
}
