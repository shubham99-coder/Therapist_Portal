const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getSummary } = require('../controllers/analyticsController');

router.get('/summary', auth, getSummary);

module.exports = router;
