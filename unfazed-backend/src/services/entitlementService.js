const SubscriptionTierConfig = require('../models/SubscriptionTierConfig')
const Therapist = require('../models/Therapist')
const Client = require('../models/Client')

const DEFAULT_TIERS = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Core practice management for a growing practice.',
    caps: { activeClients: 10 },
    features: { noteTemplates: false, advancedAnalytics: false },
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'Expanded clinical documentation and analytics.',
    caps: { activeClients: 25 },
    features: { noteTemplates: true, advancedAnalytics: true },
  },
  {
    tier: 'practice',
    name: 'Practice',
    description: 'Higher capacity for established practices.',
    caps: { activeClients: 100 },
    features: { noteTemplates: true, advancedAnalytics: true },
  },
]

async function ensureDefaultTiers() {
  for (const tier of DEFAULT_TIERS) {
    await SubscriptionTierConfig.updateOne(
      { tier: tier.tier },
      { $setOnInsert: tier },
      { upsert: true },
    )
  }
}

async function getTierForTherapist(therapistId) {
  const therapist = await Therapist.findById(therapistId).select('subscriptionTier').lean()
  const tierKey = therapist?.subscriptionTier || 'pro'
  const config = await SubscriptionTierConfig.findOne({ tier: tierKey, active: true }).lean()

  if (config) return config

  return SubscriptionTierConfig.findOne({ tier: 'starter', active: true }).lean()
}

function entitlementMap(config) {
  return {
    'clients.cap': config.caps.activeClients,
    'notes.templates': !!config.features.noteTemplates,
    'analytics.advanced': !!config.features.advancedAnalytics,
  }
}

async function canAccess(therapistId, featureKey, options = {}) {
  const config = await getTierForTherapist(therapistId)
  if (!config) return false

  if (featureKey === 'clients.cap') {
    const limit = Number(config.caps?.activeClients || 0)
    if (limit <= 0) return false
    const filter = { therapist: therapistId, status: 'active' }
    if (options.excludeClientId) filter._id = { $ne: options.excludeClientId }
    const activeCount = await Client.countDocuments(filter)
    return activeCount < limit
  }

  return entitlementMap(config)[featureKey] === true
}

async function getLimit(therapistId, featureKey) {
  const config = await getTierForTherapist(therapistId)
  if (!config) return 0

  const limits = {
    'clients.cap': config.caps.activeClients,
  }

  return limits[featureKey] ?? null
}

async function getEntitlements(therapistId) {
  const current = await getTierForTherapist(therapistId)
  const configs = await SubscriptionTierConfig.find({ active: true })
    .sort({ 'caps.activeClients': 1 })
    .lean()

  const plans = configs.map((config) => ({
    tier: config.tier,
    name: config.name,
    description: config.description,
    caps: config.caps,
    features: config.features,
  }))

  return {
    tier: current?.tier || 'pro',
    name: current?.name || 'Starter',
    description: current?.description || '',
    caps: current?.caps || { activeClients: 10 },
    features: current?.features || { noteTemplates: false, advancedAnalytics: false },
    entitlements: current ? entitlementMap(current) : {},
    plans,
  }
}

async function requireEntitlement(therapistId, featureKey) {
  const allowed = await canAccess(therapistId, featureKey)
  if (allowed) return null

  const subscription = await getEntitlements(therapistId)
  return {
    code: 'ENTITLEMENT_REQUIRED',
    featureKey,
    currentTier: subscription.tier,
    currentPlan: subscription.name,
    plans: subscription.plans,
  }
}

module.exports = {
  DEFAULT_TIERS,
  ensureDefaultTiers,
  canAccess,
  getLimit,
  getEntitlements,
  requireEntitlement,
}
