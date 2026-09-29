import api from './axiosInstance'

export const getAnalyticsSummary = (months = 6) =>
  api.get('/analytics/summary', { params: { months } }).then((r) => r.data)
