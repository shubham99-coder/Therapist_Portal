const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getPublicProfile, getMe, updateMe } = require('../controllers/therapistController');

router.get('/me', auth, getMe);          // must be BEFORE /:slug
router.put('/me', auth, updateMe);
router.get('/public/:slug', getPublicProfile);

module.exports = router;