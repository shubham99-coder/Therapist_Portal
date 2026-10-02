const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { getMine } = require('../controllers/entitlementController')

router.get('/me', auth, getMine)

module.exports = router
