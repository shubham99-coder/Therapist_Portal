const mongoose = require('mongoose')
const { Schema } = mongoose

const windowSchema = new Schema({
  start: { type: String, required: true }, // "09:00"
  end: { type: String, required: true },   // "17:00"
}, { _id: false })

const daySchema = new Schema({
  weekday: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
  isOpen: { type: Boolean, default: false },
  windows: { type: [windowSchema], default: [] },
}, { _id: false })

const overrideSchema = new Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD", specific day
  isOpen: { type: Boolean, required: true },
  windows: { type: [windowSchema], default: [] },
}, { _id: false })

const blockSchema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  reason: { type: String, default: 'Blocked' },
})

function defaultTemplate() {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
    const isWeekday = weekday >= 1 && weekday <= 5
    return { weekday, isOpen: isWeekday, windows: isWeekday ? [{ start: '09:00', end: '17:00' }] : [] }
  })
}

const availabilitySchema = new Schema({
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true, unique: true, index: true },
  timezone: { type: String, default: 'Asia/Kolkata' },
  weeklyTemplate: { type: [daySchema], default: defaultTemplate },
  overrides: { type: [overrideSchema], default: [] },
  blockedSlots: { type: [blockSchema], default: [] },
  bufferMinutes: { type: Number, default: 10 },
  allowedDurations: { type: [Number], default: [30, 45, 60, 90] },
  defaultDuration: { type: Number, default: 60 },
  minNoticeHours: { type: Number, default: 12 },
  bookingWindowDays: { type: Number, default: 30 },
}, { timestamps: true })

module.exports = mongoose.model('Availability', availabilitySchema)
