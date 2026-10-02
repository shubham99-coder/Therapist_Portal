import clientApi from './clientAxios'

export const getClientMessages = (therapistId) => clientApi.get(`/client-chat/${therapistId}`).then((r) => r.data)
export const sendClientMessage = (therapistId, text) => clientApi.post('/client-chat', { therapistId, text }).then((r) => r.data)
export const markClientMessagesRead = (therapistId) => clientApi.patch(`/client-chat/${therapistId}/read`).then((r) => r.data)
