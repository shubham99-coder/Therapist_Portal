import clientApi from './clientAxios'

export const getClientOverview = () => clientApi.get('/client-portal').then((r) => r.data)
export const getClientProfile = () => clientApi.get('/client-portal/profile').then((r) => r.data)
export const updateClientProfile = (data) => clientApi.patch('/client-portal/profile', data).then((r) => r.data)
export const getClientSessions = () => clientApi.get('/client-portal/sessions').then((r) => r.data)
export const getClientIntake = () => clientApi.get('/client-portal/intake').then((r) => r.data)
export const submitClientIntake = (data) => clientApi.put('/client-portal/intake', data).then((r) => r.data)
export const getClientPayments = () => clientApi.get('/client-portal/payments').then((r) => r.data)
export const getClientPackages = () => clientApi.get('/client-portal/packages').then((r) => r.data)
export const getClientNotes = () => clientApi.get('/client-portal/notes').then((r) => r.data)
export const createClientSessionOrder = (sessionId) => clientApi.post('/client-portal/session-order', { sessionId }).then((r) => r.data)
export const createClientPackageOrder = (packageId) => clientApi.post('/client-portal/package-order', { packageId }).then((r) => r.data)
export const downloadClientInvoice = async (paymentId) => {
  const response = await clientApi.get(`/client-portal/invoice/${paymentId}`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noreferrer'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const listClientNotifications = (limit = 30) => clientApi.get('/notifications', { params: { limit } }).then((r) => r.data)
export const markClientNotificationRead = (id) => clientApi.patch(`/notifications/${id}/read`).then((r) => r.data)
export const markAllClientNotificationsRead = () => clientApi.patch('/notifications/read-all').then((r) => r.data)
