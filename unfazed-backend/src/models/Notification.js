const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  recipientModel: { type: String, required: true, enum: ['Therapist', 'Client'] },
  type: {
    type: String,
    required: true,
    enum: ['booking_confirmed', 'session_reminder', 'post_session_followup', 'new_message', 'system'],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
}, { timestamps: true })

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })
module.exports = mongoose.model('Notification', notificationSchema)
