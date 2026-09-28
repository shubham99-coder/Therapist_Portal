const Package = require('../models/Package');
const Therapist = require('../models/Therapist');

// PRIVATE: therapist manages their own packages (Settings > Billing)
exports.listMine = async (req, res, next) => {
  try {
    res.json(await Package.find({ therapist: req.user.id }).sort({ sessions: 1 }));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, sessions, rate, validityDays } = req.body;
    if (!name || !sessions || !rate) return res.status(400).json({ message: 'name, sessions and rate are required' });
    const pkg = await Package.create({ therapist: req.user.id, name, sessions, rate, validityDays });
    res.status(201).json(pkg);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const allowed = ['name', 'sessions', 'rate', 'validityDays', 'active'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const pkg = await Package.findOneAndUpdate({ _id: req.params.id, therapist: req.user.id }, updates, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const pkg = await Package.findOneAndDelete({ _id: req.params.id, therapist: req.user.id });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ deleted: true });
  } catch (err) { next(err); }
};

// PUBLIC: booking page shows active packages for a given therapist slug
exports.listPublic = async (req, res, next) => {
  try {
    const therapist = await Therapist.findOne({ slug: req.params.slug });
    if (!therapist) return res.status(404).json({ message: 'Not found' });
    const packages = await Package.find({ therapist: therapist._id, active: true }).sort({ sessions: 1 });
    res.json(packages);
  } catch (err) { next(err); }
};
