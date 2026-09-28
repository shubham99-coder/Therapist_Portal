const mongoose = require('mongoose');

// Exactly the fields the project spec names: gateway_transaction_id, platform_fee,
// net_amount, status. packageRef is used instead of a scratch field so the webhook
// and the client-side verify handler both have a clean, typed way to find the package
// being purchased, without relying on request-time state.
const paymentSchema = new mongoose.Schema(
  {
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
    packageRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    clientPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientPackage', default: null },

    kind: { type: String, enum: ['session', 'package'], required: true },
    amount: { type: Number, required: true },     // gross, GST-inclusive, INR
    gstAmount: { type: Number, required: true },
    platform_fee: { type: Number, required: true },
    net_amount: { type: Number, required: true }, // what the therapist actually receives

    razorpay_order_id: { type: String, required: true, index: true },
    gateway_transaction_id: { type: String, default: null }, // razorpay_payment_id, set on success
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    invoiceNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
