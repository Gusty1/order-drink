import { nanoid } from 'nanoid'

/**
 * 初始化使用者：若 localStorage 無記錄，生成一組 nanoid 作為身份識別
 * 管理員身份改由 MyHeader 雙擊標題輸入密碼設定
 */
export const setUser = () => {
  const drinkUser = localStorage.getItem('drinkUser')
  if (!drinkUser) {
    const userID = nanoid()
    localStorage.setItem('drinkUser', JSON.stringify({ drinkUser: userID }))
  }
}

export const getUser = () => {
  const drinkUser = localStorage.getItem('drinkUser')
  return JSON.parse(drinkUser)
}
