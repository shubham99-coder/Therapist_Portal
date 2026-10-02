const mongoose = require('mongoose')

const subscriptionTierConfigSchema = new mongoose.Schema({
  tier: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  caps: {
    activeClients: { type: Number, required: true, min: 0 },
  },
  features: {
    noteTemplates: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
  },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierConfigSchema)
