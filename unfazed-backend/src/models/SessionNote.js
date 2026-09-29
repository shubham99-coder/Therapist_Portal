const mongoose = require('mongoose')
const { Schema } = mongoose

const sessionNoteSchema = new Schema({
  therapist: {
    type: Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
  type: {
    type: String,
    enum: ['private', 'shared'],
    default: 'private',
    required: true,
    index: true,
  },
  format: {
    type: String,
    enum: ['freeform', 'SOAP', 'DAP', 'Progress'],
    default: 'freeform',
  },
  content: {
    type: String,
    default: '<p></p>',
  },
}, { timestamps: true })

sessionNoteSchema.index({ therapist: 1, client: 1, createdAt: -1 })
sessionNoteSchema.index({ client: 1, type: 1, createdAt: -1 })

module.exports = mongoose.model('SessionNote', sessionNoteSchema)
