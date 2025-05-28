import { nanoid } from 'nanoid'
import axiosClient from '../axios/axiosClient'

export const setUser = async () => {
  const drinkUser = localStorage.getItem('drinkUser')
  if (!drinkUser) {
    const { data } = await axiosClient.get('userIP')
    if (data?.address === process.env.REACT_APP_ROOT_IP_ADDRESS) {
      localStorage.setItem('drinkUser', JSON.stringify({ drinkUser: 'root' }))
    } else {
      const userID = nanoid()
      localStorage.setItem('drinkUser', JSON.stringify({ drinkUser: userID }))
    }
  }
}

export const getUser = () => {
  const drinkUser = localStorage.getItem('drinkUser')
  return JSON.parse(drinkUser)
}
