const { requireEntitlement } = require('../services/entitlementService')

function requireFeature(featureKey) {
  return async (req, res, next) => {
    try {
      const blocked = await requireEntitlement(req.user.id, featureKey)
      if (!blocked) return next()

      return res.status(403).json({
        message: `This feature is not included in your current plan.`,
        ...blocked,
      })
    } catch (err) {
      return next(err)
    }
  }
}

module.exports = { requireFeature }
