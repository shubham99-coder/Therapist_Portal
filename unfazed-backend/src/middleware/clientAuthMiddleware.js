const jwt = require('jsonwebtoken')

module.exports = function clientAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Client authentication required' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.role !== 'client') {
      return res.status(403).json({ message: 'Client access required' })
    }
    req.user = { id: payload.id, role: 'client' }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired client session' })
  }
}
