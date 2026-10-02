const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const { sessionPrices } = require('../config/billing');
const { getEntitlements } = require('../services/entitlementService');

// PUBLIC: used by the /:slug page
exports.getPublicProfile = async (req, res, next) => {
  try {
    const t = await Therapist.findOne({ slug: req.params.slug.toLowerCase() })
      .select('name slug bio specializations languages photoUrl');
    if (!t) return res.status(404).json({ message: 'Profile not found' });
    res.json({ ...t.toObject(), sessionPrices });
  } catch (err) { next(err); }
};

// PRIVATE: logged-in therapist
exports.getMe = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

    const subscription = await getEntitlements(req.user.id);
    const [activeCount, totalCount] = await Promise.all([
      Client.countDocuments({ therapist: req.user.id, status: 'active' }),
      Client.countDocuments({ therapist: req.user.id }),
    ]);

    res.json({
      ...therapist.toObject(),
      subscriptionTier: subscription.tier,
      subscription,
      entitlements: subscription.entitlements,
      clientUsage: {
        activeCount,
        totalCount,
        activeLimit: subscription.caps?.activeClients ?? 0,
      },
    });
  } catch (err) { next(err); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'specializations', 'languages', 'photoUrl'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Slug change needs a uniqueness check
    if (req.body.slug) {
      const slug = req.body.slug.toLowerCase().trim();
      const taken = await Therapist.exists({ slug, _id: { $ne: req.user.id } });
      if (taken) return res.status(409).json({ message: 'That link is already taken' });
      updates.slug = slug;
    }

    res.json(await Therapist.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }));
  } catch (err) { next(err); }
};