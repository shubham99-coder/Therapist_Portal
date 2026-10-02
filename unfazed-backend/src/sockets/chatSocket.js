const jwt = require('jsonwebtoken')
const Therapist = require('../models/Therapist')
const Client = require('../models/Client')
const Message = require('../models/message')
const { createInAppNotification } = require('../services/notificationService')

const room = (therapistId, clientId) => `${therapistId}_${clientId}`

module.exports = function registerChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      let model = payload.role
      if (model === 'therapist') model = 'Therapist'
      if (model === 'client') model = 'Client'

      if (!model) {
        const isTherapist = await Therapist.exists({ _id: payload.id })
        if (isTherapist) model = 'Therapist'
        else {
          const isClient = await Client.exists({ _id: payload.id })
          model = isClient ? 'Client' : null
        }
      }

      if (!['Therapist', 'Client'].includes(model)) return next(new Error('Invalid chat role'))
      socket.data.userId = String(payload.id)
      socket.data.userModel = model
      next()
    } catch (err) {
      next(new Error('Invalid chat authentication'))
    }
  })

  io.on('connection', (socket) => {
    const currentUserId = socket.data.userId
    const currentUserModel = socket.data.userModel

    socket.join(`user:${currentUserId}`)

    socket.on('joinConversation', async ({ therapistId, clientId }) => {
      try {
        if (!therapistId || !clientId) return
        if (currentUserModel === 'Therapist' && String(currentUserId) !== String(therapistId)) return
        if (currentUserModel === 'Client') {
          if (String(currentUserId) !== String(clientId)) return
          const client = await Client.findOne({ _id: clientId, therapist: therapistId }).select('_id')
          if (!client) return
        }
        socket.join(room(therapistId, clientId))
      } catch (err) {
        console.error('joinConversation error:', err)
      }
    })

    socket.on('sendMessage', async ({ therapistId, clientId, text }) => {
      try {
        if (!therapistId || !clientId || !text?.trim()) return
        if (currentUserModel === 'Therapist' && String(currentUserId) !== String(therapistId)) return
        if (currentUserModel === 'Client') {
          if (String(currentUserId) !== String(clientId)) return
          const client = await Client.findOne({ _id: clientId, therapist: therapistId }).select('_id')
          if (!client) return
        }

        const therapistIsSender = currentUserModel === 'Therapist'
        const receiver = therapistIsSender ? clientId : therapistId
        const receiverModel = therapistIsSender ? 'Client' : 'Therapist'
        const conversationId = room(therapistId, clientId)

        const message = await Message.create({
          conversationId,
          sender: currentUserId,
          senderModel: currentUserModel,
          receiver,
          receiverModel,
          text: text.trim(),
        })

        io.to(conversationId).emit('newMessage', message)
        await createInAppNotification({
          recipient: receiver,
          recipientModel: receiverModel,
          type: 'new_message',
          title: therapistIsSender ? 'New therapist message' : 'New client message',
          message: text.trim().slice(0, 120),
          data: { conversationId, senderId: currentUserId },
          io,
        })
      } catch (err) {
        console.error('sendMessage socket error:', err)
        socket.emit('chatError', { message: 'Unable to send message' })
      }
    })

    socket.on('typing', ({ therapistId, clientId }) => {
      if (therapistId && clientId) socket.to(room(therapistId, clientId)).emit('userTyping', { userId: currentUserId })
    })

    socket.on('stopTyping', ({ therapistId, clientId }) => {
      if (therapistId && clientId) socket.to(room(therapistId, clientId)).emit('userStoppedTyping', { userId: currentUserId })
    })

    socket.on('markRead', async ({ therapistId, clientId }) => {
      try {
        if (!therapistId || !clientId) return
        if (currentUserModel === 'Therapist' && String(currentUserId) !== String(therapistId)) return
        if (currentUserModel === 'Client' && String(currentUserId) !== String(clientId)) return
        const conversationId = room(therapistId, clientId)
        await Message.updateMany({ conversationId, receiver: currentUserId, read: false }, { $set: { read: true, readAt: new Date() } })
        io.to(conversationId).emit('messagesRead', { userId: currentUserId })
      } catch (err) { console.error('markRead socket error:', err) }
    })
  })
}
