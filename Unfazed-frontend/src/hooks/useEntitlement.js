import { useAuth } from '../context/AuthContext'

/**
 * Frontend display helper for Module 7.
 * The backend remains the source of truth and enforces every gated action.
 */
export function useEntitlement() {
  const { therapist } = useAuth()
  const entitlements = therapist?.entitlements || {}
  const subscription = therapist?.subscription || null

  const canAccess = (featureKey) => {
    const value = entitlements[featureKey]
    if (value === undefined) return false
    return value === true || (typeof value === 'number' && value > 0)
  }

  const getLimit = (featureKey) => {
    const value = entitlements[featureKey]
    return typeof value === 'number' ? value : Infinity
  }

  return {
    canAccess,
    getLimit,
    subscription,
    plans: subscription?.plans || [],
  }
}
