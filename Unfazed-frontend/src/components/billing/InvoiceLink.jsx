import { invoiceUrl } from '../../api/payments'

/** A "Download invoice" link/button for a paid payment. Opens the PDF in a new tab. */
export default function InvoiceLink({ paymentId, children = 'Download invoice' }) {
  return (
    <a href={invoiceUrl(paymentId)} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
