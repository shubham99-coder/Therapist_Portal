require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')

const app = require('./src/app')
const connectDB = require('./src/config/db')
const registerChatSocket = require('./src/sockets/chatSocket')
const { startSessionNotificationJob } = require('./src/jobs/sessionNotificationJob')
const { ensureDefaultTiers } = require('./src/services/entitlementService')

const PORT = process.env.PORT || 5000
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
})

app.set('io', io)
registerChatSocket(io)

connectDB()
  .then(async () => {
    await ensureDefaultTiers()
    startSessionNotificationJob(io)
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  })
