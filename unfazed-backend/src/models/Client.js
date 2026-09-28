const mongoose = require('mongoose')
const { Schema } = mongoose

const clientSchema = new Schema({
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  age: { type: Number },
  concern: { type: String, trim: true },
  status: { type: String, enum: ['intake', 'active', 'on-hold'], default: 'intake' },
  source: { type: String, enum: ['manual', 'booking'], default: 'manual' },
  intake: {
    submittedAt: Date,
    presentingConcern: String,
    history: String,
    occupation: String,
    emergencyContact: String,
  },
  consent: {
    accepted: { type: Boolean, default: false },
    acceptedAt: Date,
  },
}, { timestamps: true })

clientSchema.index({ therapist: 1, email: 1 })
clientSchema.index({ therapist: 1, name: 'text' })

module.exports = mongoose.model('Client', clientSchema)
