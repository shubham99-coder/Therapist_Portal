const mongoose = require('mongoose')
const { Schema } = mongoose

const sessionSchema = new Schema({
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client' }, // linked once a Client record exists
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, lowercase: true, trim: true },
  clientPhone: { type: String, trim: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','confirmed', 'cancelled', 'completed', 'no-show'], default: 'pending' },
}, { timestamps: true })

// Double-booking prevention: only one CONFIRMED session per therapist per start time.
// A cancelled session frees the slot for someone else (partial index only applies to 'confirmed').
sessionSchema.index(
  { therapist: 1, start: 1 },
  { unique: true, partialFilterExpression: { status: 'confirmed' } },
)
sessionSchema.index({ therapist: 1, status: 1, start: 1 })

module.exports = mongoose.model('Session', sessionSchema)
