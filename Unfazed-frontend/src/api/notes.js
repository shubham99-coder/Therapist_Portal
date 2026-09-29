import api from './axiosInstance'

export const listNotes = (params) => api.get('/notes', { params }).then((r) => r.data)
export const getNote = (id) => api.get(`/notes/${id}`).then((r) => r.data)
export const createNote = (data) => api.post('/notes', data).then((r) => r.data)
export const updateNote = (id, data) => api.patch(`/notes/${id}`, data).then((r) => r.data)
export const deleteNote = (id) => api.delete(`/notes/${id}`).then((r) => r.data)

export const getSharedNotes = (clientId) => api.get(`/notes/public/${clientId}`).then((r) => r.data)
