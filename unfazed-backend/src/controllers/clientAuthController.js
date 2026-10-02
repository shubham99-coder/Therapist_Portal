const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const Client = require('../models/Client')
const Therapist = require('../models/Therapist')
const { sessionPrices } = require('../config/billing')

const signClientToken = (id) =>
  jwt.sign({ id, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '30d' })

function publicClient(client) {
  return {
    id: client._id,
    name: client.name,
    email: client.email,
    phone: client.phone || '',
    therapist: client.therapist,
    status: client.status,
    intakeSubmitted: !!client.intake?.submittedAt,
    consentAccepted: !!client.consent?.accepted,
  }
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { name, email, password, clientId, therapistSlug, phone } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    let client = null

    if (clientId) {
      client = await Client.findOne({ _id: clientId, email: normalizedEmail }).select('+password_hash')
      if (!client) return res.status(404).json({ message: 'The booking/client record could not be matched to this email' })
    } else {
      const existing = await Client.findOne({ email: normalizedEmail }).select('+password_hash')
      if (existing) {
        return res.status(409).json({ message: 'An account already exists for this email. Please log in.' })
      }

      if (!therapistSlug) {
        return res.status(400).json({ message: 'Open client registration from a therapist page or provide a booking clientId' })
      }

      const therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase().trim() }).select('_id')
      if (!therapist) return res.status(404).json({ message: 'Therapist not found' })

      client = await Client.create({
        therapist: therapist._id,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || '',
        source: 'booking',
        status: 'intake',
      })
      client = await Client.findById(client._id).select('+password_hash')
    }

    if (client.password_hash) {
      return res.status(409).json({ message: 'An account already exists for this client record. Please log in.' })
    }

    client.password_hash = await bcrypt.hash(password, 10)
    if (name?.trim()) client.name = name.trim()
    if (phone !== undefined) client.phone = phone
    await client.save()

    res.status(201).json({ token: signClientToken(client._id), client: publicClient(client) })
  } catch (err) { next(err) }
}

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const client = await Client.findOne({ email: email.toLowerCase().trim() }).select('+password_hash')
    if (!client || !client.password_hash || !(await bcrypt.compare(password, client.password_hash))) {
      return res.status(401).json({ message: 'Invalid client credentials' })
    }

    res.json({ token: signClientToken(client._id), client: publicClient(client) })
  } catch (err) { next(err) }
}

exports.me = async (req, res, next) => {
  try {
    const client = await Client.findById(req.user.id).populate('therapist', 'name slug bio specializations languages photoUrl')
    if (!client) return res.status(404).json({ message: 'Client account not found' })
    res.json({ client: publicClient(client), therapist: client.therapist ? { ...client.therapist.toObject(), sessionPrices } : null })
  } catch (err) { next(err) }
}
