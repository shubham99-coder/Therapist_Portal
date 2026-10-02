const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['Therapist', 'Client'] },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
  receiverModel: { type: String, required: true, enum: ['Therapist', 'Client'] },
  text: { type: String, required: true, trim: true, maxlength: 5000 },
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
}, { timestamps: true })

messageSchema.index({ conversationId: 1, createdAt: 1 })
module.exports = mongoose.model('Message', messageSchema)
