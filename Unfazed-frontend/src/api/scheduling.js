import api from './axiosInstance'

// Therapist-side
export const getAvailability = () => api.get('/scheduling/availability').then((r) => r.data)
export const updateAvailability = (data) => api.put('/scheduling/availability', data).then((r) => r.data)
export const addBlock = (block) => api.post('/scheduling/blocks', block).then((r) => r.data)
export const removeBlock = (blockId) => api.delete(`/scheduling/blocks/${blockId}`).then((r) => r.data)
export const listSessions = (params) => api.get('/scheduling/sessions', { params }).then((r) => r.data)
export const updateSessionStatus = (id, status) => api.patch(`/scheduling/sessions/${id}`, { status }).then((r) => r.data)

// Public (client-facing)
export const getPublicSlots = (slug, date, duration) =>
  api.get(`/scheduling/public/${slug}/slots`, { params: { date, duration } }).then((r) => r.data)
export const publicBook = (slug, payload) =>
  api.post(`/scheduling/public/${slug}/book`, payload).then((r) => r.data)
