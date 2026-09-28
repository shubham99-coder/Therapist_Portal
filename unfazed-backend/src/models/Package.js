const mongoose = require('mongoose');

// Therapist-defined session bundles (e.g. 3/6/12 sessions). Every price a client sees
// for a package comes from this collection — nothing is hardcoded in a controller or route.
const packageSchema = new mongoose.Schema(
  {
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sessions: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true, min: 0 }, // per-session rate, INR, GST-inclusive
    validityDays: { type: Number, required: true, min: 1, default: 90 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

packageSchema.virtual('totalPrice').get(function () {
  return this.rate * this.sessions;
});
packageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Package', packageSchema);
