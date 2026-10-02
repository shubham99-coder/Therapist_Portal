const Client = require('../models/Client')
const Message = require('../models/message')
const Therapist = require('../models/Therapist')
const { createInAppNotification } = require('../services/notificationService')

const room = (therapistId, clientId) => `${therapistId}_${clientId}`

async function getClientAndTherapist(req, therapistId) {
  const client = await Client.findById(req.user.id).select('therapist name email phone')
  if (!client) return { error: [404, 'Client not found'] }
  if (String(client.therapist) !== String(therapistId)) return { error: [403, 'You do not have access to this therapist'] }
  const therapist = await Therapist.findById(therapistId).select('name slug')
  if (!therapist) return { error: [404, 'Therapist not found'] }
  return { client, therapist }
}

exports.getMessages = async (req, res, next) => {
  try {
    const { client, therapist, error } = await getClientAndTherapist(req, req.params.therapistId)
    if (error) return res.status(error[0]).json({ message: error[1] })
    const conversationId = room(therapist._id, client._id)
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean()
    res.json({ messages, conversationId, therapist: { _id: therapist._id, name: therapist.name } })
  } catch (err) { next(err) }
}

exports.sendMessage = async (req, res, next) => {
  try {
    const { client, therapist, error } = await getClientAndTherapist(req, req.body.therapistId)
    if (error) return res.status(error[0]).json({ message: error[1] })
    const text = req.body.text?.trim()
    if (!text) return res.status(400).json({ message: 'Message text is required' })
    const message = await Message.create({ conversationId: room(therapist._id, client._id), sender: client._id, senderModel: 'Client', receiver: therapist._id, receiverModel: 'Therapist', text })
    const io = req.app.get('io')
    if (io) io.to(room(therapist._id, client._id)).emit('newMessage', message)
    await createInAppNotification({ recipient: therapist._id, recipientModel: 'Therapist', type: 'new_message', title: 'New client message', message: text.slice(0, 120), data: { conversationId: room(therapist._id, client._id), senderId: client._id }, io })
    res.status(201).json({ message })
  } catch (err) { next(err) }
}

exports.markMessagesRead = async (req, res, next) => {
  try {
    const { client, error } = await getClientAndTherapist(req, req.params.therapistId)
    if (error) return res.status(error[0]).json({ message: error[1] })
    await Message.updateMany({ conversationId: room(req.params.therapistId, client._id), receiver: client._id, read: false }, { $set: { read: true, readAt: new Date() } })
    res.json({ message: 'Messages marked as read' })
  } catch (err) { next(err) }
}
