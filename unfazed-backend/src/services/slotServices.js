const { zonedTimeToUtc, weekdayInTimezone } = require('../utils/timezone')

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

function dayConfigFor(availability, dateStr) {
  const override = availability.overrides.find((o) => o.date === dateStr)
  if (override) return { isOpen: override.isOpen, windows: override.windows }
  const weekday = weekdayInTimezone(dateStr, availability.timezone)
  const template = availability.weeklyTemplate.find((d) => d.weekday === weekday)
  return template ? { isOpen: template.isOpen, windows: template.windows } : { isOpen: false, windows: [] }
}

/**
 * Returns free slots for one calendar date, as UTC Date objects.
 * busy: array of { start: Date, end: Date } already-booked confirmed sessions, for that date.
 */
function getSlotsForDate({ availability, dateStr, durationMinutes, busy = [], now = new Date() }) {
  const { isOpen, windows } = dayConfigFor(availability, dateStr)
  if (!isOpen || windows.length === 0) return []

  const stepMinutes = durationMinutes + (availability.bufferMinutes || 0)
  const minNoticeMs = (availability.minNoticeHours || 0) * 3600000
  const maxAheadMs = (availability.bookingWindowDays || 30) * 86400000
  const cutoffEarliest = new Date(now.getTime() + minNoticeMs)
  const cutoffLatest = new Date(now.getTime() + maxAheadMs)

  const blocks = availability.blockedSlots || []
  const slots = []

  for (const w of windows) {
    let cursor = zonedTimeToUtc(dateStr, w.start, availability.timezone)
    const windowEnd = zonedTimeToUtc(dateStr, w.end, availability.timezone)

    while (cursor.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000)
      const tooSoon = cursor < cutoffEarliest
      const tooFar = cursor > cutoffLatest
      const blocked = blocks.some((b) => overlaps(cursor, slotEnd, b.start, b.end))
      const taken = busy.some((s) => overlaps(cursor, slotEnd, s.start, s.end))

      if (!tooSoon && !tooFar && !blocked && !taken) {
        slots.push({ start: new Date(cursor), end: slotEnd })
      }
      cursor = new Date(cursor.getTime() + stepMinutes * 60000)
    }
  }

  return slots
}

module.exports = { getSlotsForDate, overlaps }
