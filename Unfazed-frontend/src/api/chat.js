import axiosInstance from './axiosInstance'

export const getMessages = async (clientId) => {
  const { data } = await axiosInstance.get(`/chat/${clientId}`)
  return data
}

export const markMessagesRead = async (clientId) => {
  const { data } = await axiosInstance.patch(`/chat/${clientId}/read`)
  return data
}
