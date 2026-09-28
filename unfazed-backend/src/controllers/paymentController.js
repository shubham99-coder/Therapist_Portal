const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Package = require('../models/Package');
const ClientPackage = require('../models/ClientPackage');
const Session = require('../models/Session');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');
const { breakdownAmount, nextInvoiceNumber } = require('../services/paymentService');
const { buildInvoicePDF } = require('../services/invoiceService');


exports.createSessionOrder = async (req, res, next) => {
  try {
    const { sessionId, amount } = req.body;
    if (!sessionId || !amount) return res.status(400).json({ message: 'sessionId and amount are required' });

    const session = await Session.findById(sessionId); // SCHEMA: Session
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay wants paise
      currency: 'INR',
      receipt: `session_${sessionId}`,
    });

let clientId = session.client;
if (!clientId) {
  const found = await Client.findOne({ therapist: session.therapist, email: session.clientEmail });
  clientId = found?._id;
}
if (!clientId) return res.status(409).json({ message: 'No client record for this session yet' });

const { gstAmount, platform_fee, net_amount } = breakdownAmount(amount);
const payment = await Payment.create({
  therapist: session.therapist,
  client: clientId,
  session: session._id,
  kind: 'session',
  amount, gstAmount, platform_fee, net_amount,
  razorpay_order_id: order.id,
  status: 'created',
});

    res.status(201).json({
      orderId: order.id, amount: order.amount, currency: order.currency,
      paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) { next(err); }
};

// PUBLIC: create a Razorpay order for a package purchase
exports.createPackageOrder = async (req, res, next) => {
  try {
    const { packageId, clientId } = req.body;
    if (!packageId || !clientId) return res.status(400).json({ message: 'packageId and clientId are required' });

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.active) return res.status(404).json({ message: 'Package not available' });

    const amount = pkg.rate * pkg.sessions;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `pkg_${packageId}_${clientId}`,
    });

    const { gstAmount, platform_fee, net_amount } = breakdownAmount(amount);
    const payment = await Payment.create({
      therapist: pkg.therapist, client: clientId, packageRef: pkg._id,
      kind: 'package',
      amount, gstAmount, platform_fee, net_amount,
      razorpay_order_id: order.id,
      status: 'created',
    });

    res.status(201).json({
      orderId: order.id, amount: order.amount, currency: order.currency,
      paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) { next(err); }
};


async function markPaid(payment, razorpayPaymentId) {
  if (payment.status === 'paid') return payment; // already handled by the other path

  payment.status = 'paid';
  payment.gateway_transaction_id = razorpayPaymentId;
  payment.invoiceNumber = await nextInvoiceNumber(Payment);
  await payment.save();

  if (payment.kind === 'session' && payment.session) {
    await Session.findByIdAndUpdate(payment.session, { status: 'confirmed' }); // SCHEMA: Session.status
  }

  if (payment.kind === 'package' && payment.packageRef && !payment.clientPackage) {
    const pkg = await Package.findById(payment.packageRef);
    const clientPackage = await ClientPackage.create({
      client: payment.client,
      package: pkg._id,
      therapist: payment.therapist,
      sessionsTotal: pkg.sessions,
      expiresAt: new Date(Date.now() + pkg.validityDays * 86400000),
    });
    payment.clientPackage = clientPackage._id;
    await payment.save();
  }

  return payment;
}

// PUBLIC: called by the frontend right after Razorpay Checkout's handler fires.
// This gives the client instant feedback — it is NOT the source of truth (see webhook).
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.razorpay_order_id !== razorpay_order_id) return res.status(400).json({ message: 'Order mismatch' });

    await markPaid(payment, razorpay_payment_id);
    res.json({ status: 'paid', invoiceNumber: payment.invoiceNumber, paymentId: payment._id });
  } catch (err) { next(err); }
};

// PUBLIC (Razorpay calls this server-to-server): the authoritative confirmation.
// Requires the RAW request body to verify the signature — see the app.js wiring notes.
exports.razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body) // raw Buffer, not parsed JSON
      .digest('hex');
    if (signature !== expected) return res.status(400).json({ message: 'Invalid webhook signature' });

    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'payment.captured') {
      const { order_id, id: razorpayPaymentId } = event.payload.payment.entity;
      const payment = await Payment.findOne({ razorpay_order_id: order_id });
      if (payment) await markPaid(payment, razorpayPaymentId);
    }

    res.json({ received: true }); // respond fast and with 200, or Razorpay retries aggressively
  } catch (err) { next(err); }
};

// PRIVATE/PUBLIC: stream the invoice PDF for a paid payment
exports.getInvoicePDF = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || payment.status !== 'paid') return res.status(404).json({ message: 'Invoice not available' });

    const [therapist, client] = await Promise.all([
      Therapist.findById(payment.therapist),
      Client.findById(payment.client), // SCHEMA: Client
    ]);

    const description = payment.kind === 'package' ? 'Session package' : 'Therapy session';
    const pdf = await buildInvoicePDF({ payment, therapist, client, description });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${payment.invoiceNumber}.pdf`,
    });
    res.send(pdf);
  } catch (err) { next(err); }
};

// PRIVATE: therapist's billing list (Billing page)
exports.listPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ therapist: req.user.id })
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { next(err); }
};

// PRIVATE: a client's package balance, for the client profile / portal
exports.getClientPackages = async (req, res, next) => {
  try {
    const packages = await ClientPackage.find({ client: req.params.clientId }).populate('package');
    res.json(packages);
  } catch (err) { next(err); }
};
