const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const { requireFeature } = require('../middleware/entitlementMiddleware')
const { getSummary, getAdvanced } = require('../controllers/analyticsController')

router.get('/summary', auth, getSummary)
router.get('/advanced', auth, requireFeature('analytics.advanced'), getAdvanced)

module.exports = router
