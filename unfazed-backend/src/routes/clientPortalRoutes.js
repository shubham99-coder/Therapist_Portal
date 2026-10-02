const router = require('express').Router()
const auth = require('../middleware/clientAuthMiddleware')
const c = require('../controllers/clientPortalController')

router.use(auth)
router.get('/', c.getOverview)
router.get('/profile', c.getProfile)
router.patch('/profile', c.updateProfile)
router.get('/sessions', c.getSessions)
router.get('/intake', c.getIntake)
router.put('/intake', c.submitIntake)
router.get('/payments', c.getPayments)
router.get('/packages', c.getPackages)
router.get('/notes', c.getSharedNotes)
router.post('/session-order', c.createSessionOrder)
router.post('/package-order', c.createPackageOrder)
router.get('/invoice/:id', c.getInvoicePDF)

module.exports = router
