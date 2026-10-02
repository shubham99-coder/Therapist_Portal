const Client = require('../models/Client')
const Session = require('../models/Session')
const Payment = require('../models/Payment')
const SessionNote = require('../models/SessionNote')
const { canAccess, getLimit } = require('../services/entitlementService')

exports.list = async (req, res, next) => {
  try {
    const { status, search } = req.query
    const filter = { therapist: req.user.id }
    if (status && status !== 'all') filter.status = status
    if (search) filter.name = { $regex: search, $options: 'i' }
    const clients = await Client.find(filter).sort({ createdAt: -1 })
    res.json(clients)
  } catch (err) { next(err) }
}

exports.getOne = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, therapist: req.user.id })
    if (!client) return res.status(404).json({ message: 'Client not found' })
    const [sessions, payments, notes] = await Promise.all([
      Session.find({ therapist: req.user.id, client: client._id }).sort({ start: -1 }),
      Payment.find({ therapist: req.user.id, client: client._id })
        .select('kind amount status invoiceNumber gateway_transaction_id createdAt')
        .sort({ createdAt: -1 }),
      SessionNote.find({ therapist: req.user.id, client: client._id })
        .select('session type format content createdAt updatedAt')
        .sort({ createdAt: -1 }),
    ])

    res.json({
      ...client.toObject(),
      sessions,
      payments,
      notes,
      history: {
        sessionsCount: sessions.length,
        paymentsCount: payments.length,
        notesCount: notes.length,
      },
    })
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { name, age, concern, status, email, phone } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'Enter the client name' })

    const activeLimit = await getLimit(req.user.id, 'clients.cap')
    const activeCount = await Client.countDocuments({ therapist: req.user.id, status: 'active' })
    const withinLimit = await canAccess(req.user.id, 'clients.cap')
    if (!withinLimit) {
      return res.status(403).json({
        message: 'Your current plan has reached its active-client limit.',
        code: 'ENTITLEMENT_REQUIRED',
        featureKey: 'clients.cap',
        current: activeCount,
        limit: activeLimit,
      })
    }

    const client = await Client.create({
      therapist: req.user.id, name: name.trim(), age, concern, email, phone,
      status: status || 'intake',
    })
    res.status(201).json(client)
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const allowed = ['name', 'age', 'concern', 'status', 'email', 'phone']
    const updates = {}
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

    if (updates.status === 'active') {
      const activeLimit = await getLimit(req.user.id, 'clients.cap')
      const activeCount = await Client.countDocuments({
        therapist: req.user.id,
        status: 'active',
        _id: { $ne: req.params.id },
      })
      const withinLimit = await canAccess(req.user.id, 'clients.cap', { excludeClientId: req.params.id })
      if (!withinLimit) {
        return res.status(403).json({
          message: 'Your current plan has reached its active-client limit.',
          code: 'ENTITLEMENT_REQUIRED',
          featureKey: 'clients.cap',
          current: activeCount,
          limit: activeLimit,
        })
      }
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, therapist: req.user.id }, updates, { new: true, runValidators: true },
    )
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.json(client)
  } catch (err) { next(err) }
}

// Public: the client fills this in themselves after booking, no login required.
// Deliberately returns only intake-relevant fields, never therapist-only data.
exports.publicGetForIntake = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.clientId).select('name email intake consent')
    if (!client) return res.status(404).json({ message: 'Client record not found' })
    res.json(client)
  } catch (err) { next(err) }
}

exports.publicSubmitIntake = async (req, res, next) => {
  try {
    const { presentingConcern, history, occupation, emergencyContact, consent } = req.body
    if (!consent) return res.status(400).json({ message: 'Consent is required to submit the intake form' })

    const client = await Client.findById(req.params.clientId)
    if (!client) return res.status(404).json({ message: 'Client record not found' })

    client.intake = {
      submittedAt: new Date(),
      presentingConcern: presentingConcern || '',
      history: history || '',
      occupation: occupation || '',
      emergencyContact: emergencyContact || '',
    }
    client.consent = { accepted: true, acceptedAt: new Date() }
    await client.save()
    res.json(client)
  } catch (err) { next(err) }
}
