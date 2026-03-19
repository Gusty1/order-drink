import axios from 'axios'

// 開發模式由 Vite proxy 轉發，生產模式前後端同源，所以用相對路徑即可
const axiosClient = axios.create({
  baseURL: '/',
  timeout: 3000
})

export default axiosClient
