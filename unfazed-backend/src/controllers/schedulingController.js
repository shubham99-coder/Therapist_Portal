const { body, validationResult } = require('express-validator')
const Availability = require('../models/Availability')
const Session = require('../models/Session')
const { sessionPrices } = require('../config/billing')
const { notifyPostSessionFollowUp } = require('../services/notificationService')
const Client = require('../models/Client')
const Therapist = require('../models/Therapist')
const { getSlotsForDate } = require('../services/slotServices')

async function getOrCreateAvailability(therapistId) {
  let a = await Availability.findOne({ therapist: therapistId })
  if (!a) a = await Availability.create({ therapist: therapistId })
  return a
}

//Therapist-side (protected)

exports.getAvailability = async (req, res, next) => {
  try {
    res.json(await getOrCreateAvailability(req.user.id))
  } catch (err) { next(err) }
}

exports.updateAvailability = async (req, res, next) => {
  try {
    const allowed = ['timezone', 'weeklyTemplate', 'bufferMinutes', 'allowedDurations', 'defaultDuration', 'minNoticeHours', 'bookingWindowDays']
    const updates = {}
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const a = await Availability.findOneAndUpdate(
      { therapist: req.user.id }, updates, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    res.json(a)
  } catch (err) { next(err) }
}

exports.addBlock = async (req, res, next) => {
  try {
    const { start, end, reason } = req.body
    if (!start || !end || new Date(start) >= new Date(end)) {
      return res.status(400).json({ message: 'Provide a valid start and end time' })
    }
    const a = await getOrCreateAvailability(req.user.id)
    a.blockedSlots.push({ start, end, reason: reason || 'Blocked' })
    await a.save()
    res.status(201).json(a)
  } catch (err) { next(err) }
}

exports.removeBlock = async (req, res, next) => {
  try {
    const a = await Availability.findOne({ therapist: req.user.id })
    if (!a) return res.status(404).json({ message: 'Availability not found' })
    a.blockedSlots = a.blockedSlots.filter((b) => String(b._id) !== req.params.blockId)
    await a.save()
    res.json(a)
  } catch (err) { next(err) }
}

exports.listSessions = async (req, res, next) => {
  try {
    const { from, to } = req.query
    const filter = { therapist: req.user.id }
    if (from || to) {
      filter.start = {}
      if (from) filter.start.$gte = new Date(from)
      if (to) filter.start.$lte = new Date(to)
    }
    const sessions = await Session.find(filter).sort({ start: 1 })
    res.json(sessions)
  } catch (err) { next(err) }
}

exports.updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['confirmed', 'cancelled', 'completed', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapist: req.user.id }, { status }, { new: true },
    )
    if (!session) return res.status(404).json({ message: 'Session not found' })
    if (status === 'completed') {
      const [client, therapist] = await Promise.all([
        Client.findById(session.client),
        Therapist.findById(req.user.id).select('name'),
      ])
      if (client && therapist) {
        await notifyPostSessionFollowUp({
          clientId: client._id,
          clientEmail: client.email,
          clientPhone: client.phone,
          therapistName: therapist.name,
          sessionId: session._id,
          io: req.app.get('io'),
        })
      }
    }
    res.json(session)
  } catch (err) { next(err) }
}

// ---- Public (client-facing) ----

exports.publicGetSlots = async (req, res, next) => {
  try {
    const { date, duration } = req.query
    if (!date) return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' })

    const therapist = await Therapist.findOne({ slug: req.params.slug.toLowerCase() })
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' })

    const availability = await getOrCreateAvailability(therapist._id)
    const durationMinutes = Number(duration) || availability.defaultDuration

    const dayStart = new Date(`${date}T00:00:00.000Z`)
    const dayEnd = new Date(`${date}T23:59:59.999Z`)
    const busySessions = await Session.find({
      therapist: therapist._id, 
      status: { $in: ['pending', 'confirmed'] },
      start: { $gte: dayStart, $lte: dayEnd },
    })
    const busy = busySessions.map((s) => ({ start: s.start, end: s.end }))

    const slots = getSlotsForDate({ availability, dateStr: date, durationMinutes, busy })
    res.json({
      timezone: availability.timezone,
      durationMinutes,
      allowedDurations: availability.allowedDurations,
      slots: slots.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() })),
    })
  } catch (err) { next(err) }
}

exports.publicBookValidators = [
  body('start').isISO8601().withMessage('Invalid slot'),
  body('durationMinutes').isInt({ min: 15 }).withMessage('Invalid duration'),
  body('clientName').trim().notEmpty().withMessage('Enter your name'),
  body('clientEmail').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('clientPhone').optional({ checkFalsy: true }).isString(),
]

exports.publicBook = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const therapist = await Therapist.findOne({ slug: req.params.slug.toLowerCase() })
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' })

    const { start, durationMinutes, clientName, clientEmail, clientPhone } = req.body
    const startDate = new Date(start)
    const dateStr = startDate.toISOString().slice(0, 10)

    // Re-check the slot is still free right now (closes the race window as much as possible;
    // the unique index below is the real guarantee against a double-booked write).
    const availability = await getOrCreateAvailability(therapist._id)
    const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`)
    const busySessions = await Session.find({
      therapist: therapist._id, 
      status: { $in: ['pending', 'confirmed'] },
      start: { $gte: dayStart, $lte: dayEnd },
    })
    const busy = busySessions.map((s) => ({ start: s.start, end: s.end }))
    const freeSlots = getSlotsForDate({ availability, dateStr, durationMinutes, busy })
    const stillFree = freeSlots.some((s) => s.start.getTime() === startDate.getTime())
    if (!stillFree) {
      return res.status(409).json({ message: 'That slot is no longer available. Please pick another.' })
    }

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)

    // Link to (or create) a Client record for this therapist, so the booking
    // flows straight into the CRM without the client needing an account.
    let client = await Client.findOne({ therapist: therapist._id, email: clientEmail.toLowerCase() })
    if (!client) {
      client = await Client.create({
        therapist: therapist._id, name: clientName, email: clientEmail, phone: clientPhone,
        status: 'intake', source: 'booking',
      })
    }

    let session
    try {
      session = await Session.create({
        therapist: therapist._id, client: client._id, clientName, clientEmail, clientPhone,
        start: startDate, end: endDate, durationMinutes, status: 'pending',
        amount: sessionPrices[durationMinutes] || 0,
      })
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'That slot was just taken. Please pick another.' })
      }
      throw err
    }

    res.status(201).json({ session, clientId: client._id, intakeSubmitted: !!client.intake?.submittedAt, amount: session.amount })
  } catch (err) { next(err) }
}
