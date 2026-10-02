import client from './axiosInstance'


export const createSessionOrder = async (sessionId) => {
  const { data } = await client.post('/payments/session-order', { sessionId })
  return data
}

export const createPackageOrder = (packageId, clientId) =>
  client.post('/payments/package-order', { packageId, clientId }).then((r) => r.data)

export const verifyPayment = async (payload) => {
  const { data } = await client.post('/payments/verify', payload)
  return data
}

export const listPayments = () =>
  client.get('/payments').then((r) => r.data)

export const getClientPackages = (clientId) =>
  client.get(`/payments/client/${clientId}/packages`).then((r) => r.data)

export const invoiceUrl = (paymentId) => {
  const base = client.defaults.baseURL || ''
  return `${base}/payments/invoice/${paymentId}`
}
