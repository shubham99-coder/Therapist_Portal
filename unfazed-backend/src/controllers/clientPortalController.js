const razorpay = require('../config/razorpay')
const Client = require('../models/Client')
const Session = require('../models/Session')
const Payment = require('../models/Payment')
const Package = require('../models/Package')
const ClientPackage = require('../models/ClientPackage')
const SessionNote = require('../models/SessionNote')
const Therapist = require('../models/Therapist')
const { breakdownAmount } = require('../services/paymentService')
const { buildInvoicePDF } = require('../services/invoiceService')
const { sessionPrices } = require('../config/billing')

exports.getOverview = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id).populate('therapist', 'name slug bio specializations languages photoUrl')
    if (!client) return res.status(404).json({ message: 'Client not found' })

    const [sessions, payments, packages, notes] = await Promise.all([
      Session.find({ client: client._id }).sort({ start: 1 }).limit(20).lean(),
      Payment.find({ client: client._id, status: 'paid' }).sort({ createdAt: -1 }).limit(10).lean(),
      ClientPackage.find({ client: client._id }).populate('package').sort({ createdAt: -1 }).lean(),
      SessionNote.find({ client: client._id, type: 'shared' }).select('_id content format createdAt updatedAt').sort({ createdAt: -1 }).limit(5).lean(),
    ])

    res.json({
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        intake: client.intake || {},
        consent: client.consent || {},
      },
      therapist: client.therapist,
      sessions,
      payments,
      packages,
      notes,
    })
  } catch (err) { next(err) }
}

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ client: req.user.id }).sort({ start: -1 }).populate('therapist', 'name slug photoUrl').lean()
    res.json({ sessions })
  } catch (err) { next(err) }
}

exports.getProfile = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id).select('name email phone age concern status intake consent therapist')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    const therapist = await Therapist.findById(client.therapist).select('name slug bio specializations languages photoUrl')
    res.json({ client, therapist: therapist ? { ...therapist.toObject(), sessionPrices } : null })
  } catch (err) { next(err) }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'age']
    const updates = {}
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key] })
    const client = await Client.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('name email phone age concern status intake consent therapist')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.json(client)
  } catch (err) { next(err) }
}

exports.getIntake = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id).select('name email intake consent')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.json(client)
  } catch (err) { next(err) }
}

exports.submitIntake = async (req, res, next) => {
  try {
    const { presentingConcern, history, occupation, emergencyContact, consent } = req.body
    if (!consent) return res.status(400).json({ message: 'Consent is required to submit the intake form' })
    const client = await Client.findById(req.user.id)
    if (!client) return res.status(404).json({ message: 'Client not found' })
    client.intake = { submittedAt: new Date(), presentingConcern: presentingConcern || '', history: history || '', occupation: occupation || '', emergencyContact: emergencyContact || '' }
    client.consent = { accepted: true, acceptedAt: new Date() }
    await client.save()
    res.json({ client })
  } catch (err) { next(err) }
}

exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ client: req.user.id }).populate('session', 'start end durationMinutes status').populate('packageRef', 'name sessions rate validityDays').sort({ createdAt: -1 }).lean()
    res.json({ payments })
  } catch (err) { next(err) }
}

exports.getPackages = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id).select('therapist')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    const [available, owned] = await Promise.all([
      Package.find({ therapist: client.therapist, active: true }).sort({ sessions: 1 }).lean(),
      ClientPackage.find({ client: client._id }).populate('package').sort({ createdAt: -1 }).lean(),
    ])
    res.json({ available, owned })
  } catch (err) { next(err) }
}

exports.getSharedNotes = async (req, res, next) => {
  try {
    const notes = await SessionNote.find({ client: req.user.id, type: 'shared' })
      .select('_id content format createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
    res.json({ notes })
  } catch (err) { next(err) }
}

exports.createSessionOrder = async (req, res, next) => {
  try {
    const { sessionId } = req.body
    const session = await Session.findOne({ _id: sessionId, client: req.user.id })
    if (!session) return res.status(404).json({ message: 'Session not found' })
    if (session.status !== 'pending') return res.status(409).json({ message: 'This session is no longer awaiting payment' })
    if (!session.amount) return res.status(409).json({ message: 'Session price is not configured' })

    let payment = await Payment.findOne({ session: session._id, client: req.user.id, kind: 'session', status: 'created' }).sort({ createdAt: -1 })
    let order
    if (payment) {
      order = { id: payment.razorpay_order_id, amount: Math.round(session.amount * 100), currency: 'INR' }
    } else {
      order = await razorpay.orders.create({ amount: Math.round(session.amount * 100), currency: 'INR', receipt: `session_${session._id}` })
      const { gstAmount, platform_fee, net_amount } = breakdownAmount(session.amount)
      payment = await Payment.create({ therapist: session.therapist, client: session.client, session: session._id, kind: 'session', amount: session.amount, gstAmount, platform_fee, net_amount, razorpay_order_id: order.id, status: 'created' })
    }
    res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency, paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (err) { next(err) }
}

exports.createPackageOrder = async (req, res, next) => {
  try {
    const { packageId } = req.body
    const client = await Client.findById(req.user.id).select('therapist')
    if (!client) return res.status(404).json({ message: 'Client not found' })
    const pkg = await Package.findOne({ _id: packageId, therapist: client.therapist, active: true })
    if (!pkg) return res.status(404).json({ message: 'Package not available' })
    const amount = pkg.rate * pkg.sessions
    const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `pkg_${pkg._id}_${client._id}` })
    const { gstAmount, platform_fee, net_amount } = breakdownAmount(amount)
    const payment = await Payment.create({ therapist: pkg.therapist, client: client._id, packageRef: pkg._id, kind: 'package', amount, gstAmount, platform_fee, net_amount, razorpay_order_id: order.id, status: 'created' })
    res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency, paymentId: payment._id, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (err) { next(err) }
}

exports.getInvoicePDF = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, client: req.user.id, status: 'paid' })
    if (!payment) return res.status(404).json({ message: 'Invoice not available' })
    const [therapist, client] = await Promise.all([Therapist.findById(payment.therapist), Client.findById(payment.client)])
    const description = payment.kind === 'package' ? 'Session package' : 'Therapy session'
    const pdf = await buildInvoicePDF({ payment, therapist, client, description })
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=${payment.invoiceNumber}.pdf` })
    res.send(pdf)
  } catch (err) { next(err) }
}
