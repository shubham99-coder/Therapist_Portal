// Converts a local wall-clock time in a given IANA timezone to a UTC Date,

function getOffsetMinutes(utcGuess, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const parts = dtf.formatToParts(utcGuess).reduce((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value
    return acc
  }, {})
  const asIfUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return (asIfUTC - utcGuess.getTime()) / 60000
}

function zonedTimeToUtc(dateStr, timeStr, timeZone) {
  const guess = new Date(`${dateStr}T${timeStr}:00Z`)
  const offsetMinutes = getOffsetMinutes(guess, timeZone)
  return new Date(guess.getTime() - offsetMinutes * 60000)
}

// Weekday (0=Sun..6=Sat) of a "YYYY-MM-DD" date as it falls in the given timezone
function weekdayInTimezone(dateStr, timeZone) {
  const noonUtc = new Date(`${dateStr}T12:00:00Z`)
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' })
  const short = dtf.format(noonUtc)
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[short]
}

module.exports = { zonedTimeToUtc, weekdayInTimezone }
