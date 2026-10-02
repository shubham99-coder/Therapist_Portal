const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const controller = require('../controllers/notificationController')

router.get('/', auth, controller.listNotifications)
router.patch('/:id/read', auth, controller.markRead)
router.patch('/read-all', auth, controller.markAllRead)

module.exports = router
