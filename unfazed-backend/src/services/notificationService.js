const nodemailer = require('nodemailer')
const Notification = require('../models/Notification')

let transporter = null
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

async function createInAppNotification({ recipient, recipientModel, type, title, message, data = {}, io, dedupeKey }) {
  if (dedupeKey) {
    const existing = await Notification.findOne({ recipient, type, 'data.dedupeKey': dedupeKey })
    if (existing) return existing
  }
  const notification = await Notification.create({
    recipient,
    recipientModel,
    type,
    title,
    message,
    data: dedupeKey ? { ...data, dedupeKey } : data,
  })
  if (io) io.to(`user:${recipient}`).emit('newNotification', notification)
  return notification
}

async function sendEmail({ to, subject, text }) {
  if (!transporter || !to) return console.log('[EMAIL STUB]', { to, subject, text })
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text })
}

async function sendWhatsApp({ phone, message }) {
  console.log('[WHATSAPP STUB]', { phone, message })
  return { queued: true }
}

exports.createInAppNotification = createInAppNotification
exports.sendEmail = sendEmail
exports.sendWhatsApp = sendWhatsApp

exports.notifyBookingConfirmed = async ({ clientId, clientEmail, clientPhone, therapistId, therapistEmail, therapistName, start, io, sessionId }) => {
  const message = `Your therapy booking with ${therapistName} has been confirmed for ${new Date(start).toLocaleString('en-IN')}.`
  await createInAppNotification({ recipient: clientId, recipientModel: 'Client', type: 'booking_confirmed', title: 'Booking confirmed', message, data: { start, sessionId }, dedupeKey: `booking:${sessionId}:client`, io })
  if (therapistId) {
    await createInAppNotification({ recipient: therapistId, recipientModel: 'Therapist', type: 'booking_confirmed', title: 'Booking confirmed', message: `A client booking is confirmed for ${new Date(start).toLocaleString('en-IN')}.`, data: { start, sessionId }, dedupeKey: `booking:${sessionId}:therapist`, io })
  }
  await sendEmail({ to: clientEmail, subject: 'Therapy booking confirmed', text: message })
  await sendWhatsApp({ phone: clientPhone, message })
  if (therapistEmail) await sendEmail({ to: therapistEmail, subject: 'New confirmed therapy booking', text: `A client booking is confirmed for ${new Date(start).toLocaleString('en-IN')}.` })
}

exports.notifySessionReminder = async ({ clientId, clientEmail, clientPhone, therapistId, therapistEmail, therapistName, start, io, sessionId }) => {
  const message = `Reminder: your therapy session with ${therapistName} is scheduled for ${new Date(start).toLocaleString('en-IN')}.`
  await createInAppNotification({ recipient: clientId, recipientModel: 'Client', type: 'session_reminder', title: 'Session reminder', message, data: { start, sessionId }, dedupeKey: `reminder24:${sessionId}:client`, io })
  if (therapistId) await createInAppNotification({ recipient: therapistId, recipientModel: 'Therapist', type: 'session_reminder', title: 'Session reminder', message: `You have a therapy session in about 24 hours (${new Date(start).toLocaleString('en-IN')}).`, data: { start, sessionId }, dedupeKey: `reminder24:${sessionId}:therapist`, io })
  await sendEmail({ to: clientEmail, subject: 'Therapy session reminder', text: message })
  await sendWhatsApp({ phone: clientPhone, message })
  if (therapistEmail) await sendEmail({ to: therapistEmail, subject: 'Therapy session reminder', text: `You have a therapy session in about 24 hours (${new Date(start).toLocaleString('en-IN')}).` })
}

exports.notifyPostSessionFollowUp = async ({ clientId, clientEmail, clientPhone, therapistName, sessionId, io }) => {
  const message = `Thank you for attending your session with ${therapistName}. Please review your client portal for shared notes and upcoming sessions.`
  await createInAppNotification({ recipient: clientId, recipientModel: 'Client', type: 'post_session_followup', title: 'Session follow-up', message, data: { sessionId }, dedupeKey: `post:${sessionId}:client`, io })
  await sendEmail({ to: clientEmail, subject: 'Follow-up after your therapy session', text: message })
  await sendWhatsApp({ phone: clientPhone, message })
}
