const router = require('express').Router()
const { body } = require('express-validator')
const auth = require('../middleware/clientAuthMiddleware')
const c = require('../controllers/clientAuthController')

router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], c.register)

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], c.login)

router.get('/me', auth, c.me)

module.exports = router
