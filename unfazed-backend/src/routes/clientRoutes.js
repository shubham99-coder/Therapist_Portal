const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const c = require('../controllers/clientController')

// Public intake, no auth — must come before the protected /:id routes 
router.get('/public/:clientId/intake', c.publicGetForIntake)
router.post('/public/:clientId/intake', c.publicSubmitIntake)

router.get('/', auth, c.list)
router.get('/:id', auth, c.getOne)
router.post('/', auth, c.create)
router.patch('/:id', auth, c.update)

module.exports = router
