import client from './client'

export const listMyPackages = () => client.get('/packages/mine').then((r) => r.data)
export const createPackage = (data) => client.post('/packages', data).then((r) => r.data)
export const updatePackage = (id, data) => client.put(`/packages/${id}`, data).then((r) => r.data)
export const deletePackage = (id) => client.delete(`/packages/${id}`).then((r) => r.data)

export const listPublicPackages = (slug) => client.get(`/packages/public/${slug}`).then((r) => r.data)
