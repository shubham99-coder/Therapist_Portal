const cron = require('node-cron')
const Session = require('../models/Session')
const Client = require('../models/Client')
const Therapist = require('../models/Therapist')
const { notifySessionReminder } = require('../services/notificationService')

let started = false

async function runSessionReminderJob(io) {
  const now = Date.now()
  const from = new Date(now + 23.75 * 60 * 60 * 1000)
  const to = new Date(now + 24.25 * 60 * 60 * 1000)
  const sessions = await Session.find({ status: 'confirmed', start: { $gte: from, $lte: to }, client: { $ne: null } }).select('_id therapist client start')

  for (const session of sessions) {
    try {
      const [client, therapist] = await Promise.all([
        Client.findById(session.client),
        Therapist.findById(session.therapist),
      ])
      if (!client || !therapist) continue
      await notifySessionReminder({
        clientId: client._id,
        clientEmail: client.email,
        clientPhone: client.phone,
        therapistId: therapist._id,
        therapistEmail: therapist.email,
        therapistName: therapist.name,
        start: session.start,
        sessionId: session._id,
        io,
      })
    } catch (err) {
      console.error(`24h reminder failed for session ${session._id}:`, err)
    }
  }
}

function startSessionNotificationJob(io) {
  if (started) return
  started = true
  runSessionReminderJob(io).catch((err) => console.error('Initial reminder run failed:', err))
  cron.schedule('*/15 * * * *', () => runSessionReminderJob(io).catch((err) => console.error('Reminder job failed:', err)))
  console.log('Session notification scheduler started')
}

module.exports = { startSessionNotificationJob, runSessionReminderJob }
