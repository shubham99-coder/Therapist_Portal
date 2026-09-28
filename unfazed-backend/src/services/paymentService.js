const { gstRate, platformFeeRate } = require('../config/billing');

/**
 * Splits a gross, GST-inclusive amount into its GST component, the platform's cut,
 * and what the therapist actually receives. This is the one place that math happens,
 * so a figure is never computed two different ways in two controllers.
 */
function breakdownAmount(grossAmount) {
  const gstAmount = Math.round(grossAmount - grossAmount / (1 + gstRate));
  const platform_fee = Math.round(grossAmount * platformFeeRate);
  const net_amount = grossAmount - platform_fee;
  return { gstAmount, platform_fee, net_amount };
}

/** Sequential, human-readable invoice numbers: INV-0001, INV-0002, ... */
async function nextInvoiceNumber(Payment) {
  const last = await Payment.findOne({ invoiceNumber: { $exists: true } }).sort({ createdAt: -1 });
  const lastNum = last ? Number(last.invoiceNumber.split('-')[1]) : 0;
  return `INV-${String(lastNum + 1).padStart(4, '0')}`;
}

module.exports = { breakdownAmount, nextInvoiceNumber };
