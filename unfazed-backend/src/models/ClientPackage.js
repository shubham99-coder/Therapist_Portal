const mongoose = require('mongoose');

// A client's purchased bundle: how many sessions are left and when it expires.
// A booking checks this before falling back to a single-session charge.
const clientPackageSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
    sessionsTotal: { type: Number, required: true },
    sessionsUsed: { type: Number, default: 0 },
    purchasedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'exhausted'], default: 'active' },
  },
  { timestamps: true }
);

clientPackageSchema.methods.hasSessionsLeft = function () {
  return this.status === 'active' && this.sessionsUsed < this.sessionsTotal && this.expiresAt > new Date();
};

clientPackageSchema.methods.consumeOne = async function () {
  this.sessionsUsed += 1;
  if (this.sessionsUsed >= this.sessionsTotal) this.status = 'exhausted';
  await this.save();
};

module.exports = mongoose.model('ClientPackage', clientPackageSchema);
