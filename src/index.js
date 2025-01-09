import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider } from 'antd'
// import enUS from 'antd/es/locale/ex_US'
import zhTW from 'antd/es/locale/zh_TW' // 繁體中文
import { theme } from 'antd'
import 'antd/dist/reset.css' // 從 Ant Design v5 開始的樣式

const root = ReactDOM.createRoot(document.getElementById('root'))
//theme.darkAlgorithm 預設黑暗模式
root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhTW}
      componentSize="large"
      theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
