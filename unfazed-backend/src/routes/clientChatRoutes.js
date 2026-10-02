const router = require('express').Router()
const auth = require('../middleware/clientAuthMiddleware')
const c = require('../controllers/clientChatController')

router.use(auth)
router.get('/:therapistId', c.getMessages)
router.post('/', c.sendMessage)
router.patch('/:therapistId/read', c.markMessagesRead)

module.exports = router
