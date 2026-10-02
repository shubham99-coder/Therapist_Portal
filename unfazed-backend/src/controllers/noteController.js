const mongoose = require('mongoose')
const SessionNote = require('../models/SessionNote')
const Client = require('../models/Client')
const Session = require('../models/Session')
const { canAccess } = require('../services/entitlementService')

const allowedTypes = new Set(['private', 'shared'])
const allowedFormats = new Set(['freeform', 'SOAP', 'DAP', 'Progress'])

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

function therapistFilter(req) {
  return { therapist: req.user.id }
}

function serializeTherapistNote(note) {
  const value = note.toObject ? note.toObject() : note
  return {
    ...value,
    client: value.client && typeof value.client === 'object'
      ? { _id: value.client._id, name: value.client.name, email: value.client.email }
      : value.client,
  }
}

function serializeSharedNote(note) {
  return {
    _id: note._id,
    content: note.content,
    format: note.format,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

async function assertClientBelongsToTherapist(clientId, therapistId) {
  if (!isValidId(clientId)) return null
  return Client.findOne({ _id: clientId, therapist: therapistId }).select('_id name email')
}

async function assertSessionBelongsToTherapist(sessionId, therapistId, clientId) {
  if (!sessionId) return null
  if (!isValidId(sessionId)) return null
  return Session.findOne({
    _id: sessionId,
    therapist: therapistId,
    ...(clientId ? { client: clientId } : {}),
  }).select('_id client therapist')
}

exports.list = async (req, res, next) => {
  try {
    const filter = therapistFilter(req)
    if (req.query.clientId) {
      if (!isValidId(req.query.clientId)) return res.status(400).json({ message: 'Invalid client id' })
      filter.client = req.query.clientId
    }
    if (req.query.type && allowedTypes.has(req.query.type)) filter.type = req.query.type

    const notes = await SessionNote.find(filter)
      .populate('client', 'name email')
      .populate('session', 'start end durationMinutes status')
      .sort({ createdAt: -1 })

    res.json(notes.map(serializeTherapistNote))
  } catch (err) {
    next(err)
  }
}

exports.getOne = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Note not found' })

    const note = await SessionNote.findOne({
      _id: req.params.id,
      ...therapistFilter(req),
    })
      .populate('client', 'name email')
      .populate('session', 'start end durationMinutes status')

    if (!note) return res.status(404).json({ message: 'Note not found' })
    res.json(serializeTherapistNote(note))
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const { clientId, sessionId, type = 'private', format = 'freeform', content = '<p></p>' } = req.body

    if (!clientId) return res.status(400).json({ message: 'clientId is required' })
    if (!allowedTypes.has(type)) return res.status(400).json({ message: 'Invalid note type' })
    if (!allowedFormats.has(format)) return res.status(400).json({ message: 'Invalid note format' })

    if (format !== 'freeform' && !(await canAccess(req.user.id, 'notes.templates'))) {
      return res.status(403).json({
        message: 'Structured note templates are not included in your current plan.',
        code: 'ENTITLEMENT_REQUIRED',
        featureKey: 'notes.templates',
      })
    }

    const client = await assertClientBelongsToTherapist(clientId, req.user.id)
    if (!client) return res.status(404).json({ message: 'Client not found' })

    let session = null
    if (sessionId) {
      session = await assertSessionBelongsToTherapist(sessionId, req.user.id, client._id)
      if (!session) return res.status(404).json({ message: 'Session not found for this client' })
    }

    const note = await SessionNote.create({
      therapist: req.user.id,
      client: client._id,
      session: session?._id || null,
      type,
      format,
      content: typeof content === 'string' ? content : '<p></p>',
    })

    const populated = await SessionNote.findById(note._id)
      .populate('client', 'name email')
      .populate('session', 'start end durationMinutes status')

    res.status(201).json(serializeTherapistNote(populated))
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Note not found' })

    const note = await SessionNote.findOne({
      _id: req.params.id,
      ...therapistFilter(req),
    })
    if (!note) return res.status(404).json({ message: 'Note not found' })

    const { type, format, content, sessionId } = req.body

    if (type !== undefined) {
      if (!allowedTypes.has(type)) return res.status(400).json({ message: 'Invalid note type' })
      note.type = type
    }

    if (format !== undefined) {
      if (!allowedFormats.has(format)) return res.status(400).json({ message: 'Invalid note format' })
      if (format !== 'freeform' && !(await canAccess(req.user.id, 'notes.templates'))) {
        return res.status(403).json({
          message: 'Structured note templates are not included in your current plan.',
          code: 'ENTITLEMENT_REQUIRED',
          featureKey: 'notes.templates',
        })
      }
      note.format = format
    }

    if (content !== undefined) {
      if (typeof content !== 'string') return res.status(400).json({ message: 'Note content must be text' })
      note.content = content
    }

    if (sessionId !== undefined) {
      if (!sessionId) {
        note.session = null
      } else {
        const session = await assertSessionBelongsToTherapist(sessionId, req.user.id, note.client)
        if (!session) return res.status(404).json({ message: 'Session not found for this client' })
        note.session = session._id
      }
    }

    await note.save()

    const populated = await SessionNote.findById(note._id)
      .populate('client', 'name email')
      .populate('session', 'start end durationMinutes status')

    res.json(serializeTherapistNote(populated))
  } catch (err) {
    next(err)
  }
}

exports.remove = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Note not found' })

    const note = await SessionNote.findOneAndDelete({
      _id: req.params.id,
      ...therapistFilter(req),
    })

    if (!note) return res.status(404).json({ message: 'Note not found' })
    res.json({ message: 'Note deleted' })
  } catch (err) {
    next(err)
  }
}

// Public client-facing endpoint. This serializer intentionally exposes ONLY
// shared notes. Private notes are filtered in MongoDB and are never returned.
exports.publicShared = async (req, res, next) => {
  try {
    if (!isValidId(req.params.clientId)) return res.status(404).json({ message: 'Client record not found' })

    const client = await Client.findById(req.params.clientId).select('_id name')
    if (!client) return res.status(404).json({ message: 'Client record not found' })

    const notes = await SessionNote.find({
      client: client._id,
      type: 'shared',
    })
      .select('_id content format createdAt updatedAt')
      .sort({ createdAt: -1 })

    res.json({
      client: { _id: client._id, name: client.name },
      notes: notes.map(serializeSharedNote),
    })
  } catch (err) {
    next(err)
  }
}
