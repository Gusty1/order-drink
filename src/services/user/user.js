import { nanoid } from 'nanoid'
import axiosClient from '../axios/axiosClient'
import { defaultSetting } from '../../constants'

export const setUser = async () => {
  const drinkUser = localStorage.getItem('drinkUser')
  if (!drinkUser) {
    const { data } = await axiosClient.get('userIP')
    if (data?.address === defaultSetting.rootIPAddress) {
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
