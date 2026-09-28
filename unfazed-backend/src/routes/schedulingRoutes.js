const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const c = require('../controllers/schedulingController')

// Therapist-side (protected)
router.get('/availability', auth, c.getAvailability)
router.put('/availability', auth, c.updateAvailability)
router.post('/blocks', auth, c.addBlock)
router.delete('/blocks/:blockId', auth, c.removeBlock)
router.get('/sessions', auth, c.listSessions)
router.patch('/sessions/:id', auth, c.updateSessionStatus)

// Public (client-facing, no auth)
router.get('/public/:slug/slots', c.publicGetSlots)
router.post('/public/:slug/book', c.publicBookValidators, c.publicBook)

module.exports = router
