const Therapist = require('../models/Therapist');

// PUBLIC: used by the /:slug page
exports.getPublicProfile = async (req, res, next) => {
  try {
    const t = await Therapist.findOne({ slug: req.params.slug.toLowerCase() })
      .select('name slug bio specializations languages photoUrl');
    if (!t) return res.status(404).json({ message: 'Profile not found' });
    res.json(t);
  } catch (err) { next(err); }
};

// PRIVATE: logged-in therapist
exports.getMe = async (req, res, next) => {
  try {
    res.json(await Therapist.findById(req.user.id));
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