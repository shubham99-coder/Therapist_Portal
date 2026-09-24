const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean), }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/therapists', require('./routes/therapistRoutes'));

app.use(errorHandler);
module.exports = app;