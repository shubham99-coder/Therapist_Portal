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
    // plan tier will be added in Module 7 via SubscriptionTierConfig, don't hardcode it here
  },
  { timestamps: true }
);

module.exports = mongoose.model('Therapist', therapistSchema);