const PDFDocument = require('pdfkit');

/** Builds a simple GST-style tax invoice as a PDF buffer. */
function buildInvoicePDF({ payment, therapist, client, description }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#000').text(therapist.name);
    doc.fontSize(10).fillColor('#555');
    if (therapist.title) doc.text(therapist.title);
    doc.text('GSTIN: 27ABCDE1234F1Z5'); // replace with the therapist's real GSTIN field once added to the model
    doc.moveDown();

    doc.fillColor('#000').fontSize(14).text('Tax Invoice', { align: 'right' });
    doc.fontSize(10).fillColor('#555')
      .text(payment.invoiceNumber, { align: 'right' })
      .text(new Date(payment.createdAt).toLocaleDateString('en-IN'), { align: 'right' });
    doc.moveDown(2);

    doc.fillColor('#000').fontSize(11).text('Billed to:');
    doc.text(client.name);
    doc.text(client.email);
    doc.moveDown();

    const taxable = payment.amount - payment.gstAmount;
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown(0.5);

    doc.fillColor('#000').text(description, 50, doc.y, { continued: true });
    doc.text(`Rs. ${taxable.toFixed(2)}`, { align: 'right' });

    doc.fillColor('#555').text('GST @ 18% (included)', 50, doc.y + 5, { continued: true });
    doc.text(`Rs. ${payment.gstAmount.toFixed(2)}`, { align: 'right' });
    doc.moveDown(0.5);

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown(0.5);

    doc.fillColor('#000').fontSize(13).text('Total', 50, doc.y, { continued: true });
    doc.text(`Rs. ${payment.amount.toFixed(2)}`, { align: 'right' });

    if (payment.status === 'paid') {
      doc.moveDown(2).fontSize(9).fillColor('#888').text(`Payment reference: ${payment.gateway_transaction_id}`);
    }

    doc.end();
  });
}

module.exports = { buildInvoicePDF };
