const Session = require('../models/Session')
const Notification = require('../models/Notification')
const { createInAppNotification } = require('./notificationService')

function idOf(value) {
  if (!value) return null
  return String(value._id || value.id || value)
}

async function notifyRecipient({ recipient, recipientModel, type, title, message, data, io }) {
  if (!recipient) return null

  return createInAppNotification({
    recipient,
    recipientModel,
    type,
    title,
    message,
    data,
    io,
  })
}

async function notifyBookingConfirmed(session, io) {
  if (!session || session.status !== 'confirmed') return

  const sessionId = idOf(session._id)
  const start = session.start ? new Date(session.start).toLocaleString('en-IN') : 'the scheduled time'

  const notifications = []

  const therapistId = idOf(session.therapist)
  if (therapistId) {
    notifications.push(await notifyRecipient({
      recipient: therapistId,
      recipientModel: 'Therapist',
      type: 'booking_confirmed',
      title: 'Booking confirmed',
      message: `A therapy session has been confirmed for ${start}.`,
      data: { event: 'booking_confirmed', sessionId, start: session.start },
      io,
    }))
  }

  const clientId = idOf(session.client)
  if (clientId) {
    notifications.push(await notifyRecipient({
      recipient: clientId,
      recipientModel: 'Client',
      type: 'booking_confirmed',
      title: 'Booking confirmed',
      message: `Your therapy session is confirmed for ${start}.`,
      data: { event: 'booking_confirmed', sessionId, start: session.start },
      io,
    }))
  }

  return notifications
}

async function notifySessionReminder(session, io) {
  if (!session || session.status !== 'confirmed') return

  const sessionId = idOf(session._id)
  const start = session.start ? new Date(session.start).toLocaleString('en-IN') : 'the scheduled time'

  const notifications = []

  const therapistId = idOf(session.therapist)
  if (therapistId) {
    notifications.push(await notifyRecipient({
      recipient: therapistId,
      recipientModel: 'Therapist',
      type: 'session_reminder',
      title: 'Session reminder',
      message: `You have a therapy session in about 24 hours (${start}).`,
      data: { event: 'session_reminder_24h', sessionId, start: session.start },
      io,
    }))
  }

  const clientId = idOf(session.client)
  if (clientId) {
    notifications.push(await notifyRecipient({
      recipient: clientId,
      recipientModel: 'Client',
      type: 'session_reminder',
      title: 'Session reminder',
      message: `Your therapy session is in about 24 hours (${start}).`,
      data: { event: 'session_reminder_24h', sessionId, start: session.start },
      io,
    }))
  }

  return notifications
}

async function notifyPostSession(session, io) {
  if (!session || session.status !== 'completed') return

  const clientId = idOf(session.client)
  if (!clientId) return

  return notifyRecipient({
    recipient: clientId,
    recipientModel: 'Client',
    type: 'post_session_followup',
    title: 'Session follow-up',
    message: 'Your therapy session has been completed. You can review your next steps in your client portal.',
    data: {
      event: 'post_session',
      sessionId: idOf(session._id),
      start: session.start,
      end: session.end,
    },
    io,
  })
}

async function reminderAlreadySent(sessionId) {
  return Boolean(await Notification.exists({
    type: 'session_reminder',
    'data.sessionId': String(sessionId),
    'data.event': 'session_reminder_24h',
  }))
}

module.exports = {
  notifyBookingConfirmed,
  notifySessionReminder,
  notifyPostSession,
  reminderAlreadySent,
  Session,
}
