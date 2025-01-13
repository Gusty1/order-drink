import axiosClient from '../axios/axiosClient'

export const setOrder = (data) => {
  return axiosClient.post('setOrder', data)
}

export const getTodayOrders = () => {
  return axiosClient.get('getTodayOrders')
}

export const getOrder = (id) => {
  return axiosClient.get(`getOrder/${id}`)
}

export const deleteOrder = (id) => {
  return axiosClient.delete(`deleteOrder/${id}`)
}
