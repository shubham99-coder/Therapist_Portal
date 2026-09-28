const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { razorpayWebhook } = require('./controllers/paymentController');

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean),
}));

app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/therapists', require('./routes/therapistRoutes'));
app.use('/api/scheduling', require('./routes/schedulingRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.use(errorHandler);

module.exports = app;