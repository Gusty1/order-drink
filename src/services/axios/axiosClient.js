import axios from 'axios'
import { defaultSetting } from '../../constants'

// 創建一個 axios 實例
const axiosClient = axios.create({
  baseURL: `http://${defaultSetting.rootIPAddress}:5000/`,
  timeout: 3000 // 設置請求超時時間
})

// 請求攔截器
axiosClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 響應攔截器
axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axiosClient
