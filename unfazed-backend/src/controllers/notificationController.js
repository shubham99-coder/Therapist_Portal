const Notification = require('../models/Notification')
const userId = (req) => req.user.therapistId || req.user.id || req.user._id

exports.listNotifications = async (req, res, next) => {
  try {
    const recipient = userId(req)
    const limit = Math.min(Number(req.query.limit) || 30, 100)
    const notifications = await Notification.find({ recipient }).sort({ createdAt: -1 }).limit(limit).lean()
    const unreadCount = await Notification.countDocuments({ recipient, read: false })
    res.json({ notifications, unreadCount })
  } catch (err) { next(err) }
}

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId(req) },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    )
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json({ notification })
  } catch (err) { next(err) }
}

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: userId(req), read: false }, { $set: { read: true, readAt: new Date() } })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) { next(err) }
}
