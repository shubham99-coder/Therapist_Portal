import api from './axiosInstance'

export const getAnalyticsSummary = (months = 6) =>
  api.get('/analytics/summary', { params: { months } }).then((r) => r.data)

export const getAnalyticsAdvanced = () =>
  api.get('/analytics/advanced').then((r) => r.data)
