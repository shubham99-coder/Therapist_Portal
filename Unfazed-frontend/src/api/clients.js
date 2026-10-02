import api from './axiosInstance'

export const listClients = (params) => api.get('/clients', { params }).then((r) => r.data)
export const getClient = (id) => api.get(`/clients/${id}`).then((r) => r.data)
export const createClient = (data) => api.post('/clients', data).then((r) => r.data)
export const updateClient = (id, data) => api.patch(`/clients/${id}`, data).then((r) => r.data)

export const getIntakeRecord = (clientId) => api.get(`/clients/public/${clientId}/intake`).then((r) => r.data)
export const submitIntake = (clientId, data) => api.post(`/clients/public/${clientId}/intake`, data).then((r) => r.data)
