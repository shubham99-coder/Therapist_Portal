import { useAuth } from '../context/AuthContext'

/**
 * Frontend mirror of the backend Entitlement Service (Module 7).
 * The server is the source of truth; this only decides what to show.
 *
 * Until Module 7 exists the backend sends no entitlements, so every
 * feature is allowed. Once GET /therapists/me returns
 *   entitlements: { 'analytics.advanced': true, 'clients.cap': 25, ... }
 * this hook starts gating the UI with no other change.
 */
export function useEntitlement() {
  const { therapist } = useAuth()
  const entitlements = therapist?.entitlements

  const canAccess = (featureKey) => {
    if (!entitlements) return true
    const value = entitlements[featureKey]
    return value === undefined ? false : !!value
  }

  const getLimit = (featureKey) => entitlements?.[featureKey] ?? Infinity

  return { canAccess, getLimit }
}
