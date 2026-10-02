const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true, select: false }, // never returned by default
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    bio: { type: String, default: '' },
    specializations: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    photoUrl: { type: String, default: '' },
    // Module 7: tier is resolved through SubscriptionTierConfig; routes never gate on this string directly.
    subscriptionTier: { type: String, default: 'pro', lowercase: true, trim: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Therapist', therapistSchema);