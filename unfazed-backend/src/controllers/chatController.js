const Message = require('../models/message')

const userId = (req) => req.user.therapistId || req.user.id || req.user._id
const room = (therapistId, clientId) => `${therapistId}_${clientId}`

exports.getMessages = async (req, res, next) => {
  try {
    const therapistId = userId(req)
    const conversationId = room(therapistId, req.params.clientId)
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean()
    res.json({ messages, conversationId })
  } catch (err) { next(err) }
}

exports.sendMessage = async (req, res, next) => {
  try {
    const therapistId = userId(req)
    const { clientId, text } = req.body
    if (!clientId || !text?.trim()) return res.status(400).json({ message: 'clientId and text are required' })
    const message = await Message.create({
      conversationId: room(therapistId, clientId),
      sender: therapistId, senderModel: 'Therapist',
      receiver: clientId, receiverModel: 'Client',
      text: text.trim(),
    })
    res.status(201).json({ message })
  } catch (err) { next(err) }
}

exports.markMessagesRead = async (req, res, next) => {
  try {
    const therapistId = userId(req)
    await Message.updateMany(
      { conversationId: room(therapistId, req.params.clientId), receiver: therapistId, read: false },
      { $set: { read: true, readAt: new Date() } }
    )
    res.json({ message: 'Messages marked as read' })
  } catch (err) { next(err) }
}
