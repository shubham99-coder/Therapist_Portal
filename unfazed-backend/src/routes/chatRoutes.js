const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const controller = require('../controllers/chatController')

router.get('/:clientId', auth, controller.getMessages)
router.post('/', auth, controller.sendMessage)
router.patch('/:clientId/read', auth, controller.markMessagesRead)

module.exports = router
