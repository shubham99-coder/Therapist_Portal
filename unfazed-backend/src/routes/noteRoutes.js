const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const c = require('../controllers/noteController')

// Public route must be defined before /:id.
// It can only ever return notes whose type is "shared".
router.get('/public/:clientId', c.publicShared)

router.get('/', auth, c.list)
router.get('/:id', auth, c.getOne)
router.post('/', auth, c.create)
router.patch('/:id', auth, c.update)
router.delete('/:id', auth, c.remove)

module.exports = router
