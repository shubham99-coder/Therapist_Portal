const { getEntitlements } = require('../services/entitlementService')

exports.getMine = async (req, res, next) => {
  try {
    res.json(await getEntitlements(req.user.id))
  } catch (err) {
    next(err)
  }
}
