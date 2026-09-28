const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/paymentController');

router.post('/session-order', c.createSessionOrder);
router.post('/package-order', c.createPackageOrder);
router.post('/verify', c.verifyPayment);
router.get('/invoice/:id', c.getInvoicePDF);
router.get('/client/:clientId/packages', auth, c.getClientPackages);
router.get('/', auth, c.listPayments);

// Note: the webhook route (POST /api/webhooks/razorpay) is NOT here — it is mounted
// directly in app.js, before express.json(), because it needs the raw request body.

module.exports = router;
