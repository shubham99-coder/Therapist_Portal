function parseSessionPrices() {
  try {
    const parsed = JSON.parse(process.env.SESSION_PRICES_JSON || '{"60":3000,"90":4500}')
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [Number(k), Number(v)]))
  } catch {
    return { 60: 3000, 90: 4500 }
  }
}

module.exports = {
  gstRate: Number(process.env.GST_RATE || 0.18),
  platformFeeRate: Number(process.env.PLATFORM_FEE_RATE || 0.02),
  currency: 'INR',
  cancellationHours: Number(process.env.CANCELLATION_HOURS || 24),
  sessionPrices: parseSessionPrices(),
}
