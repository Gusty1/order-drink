import { ConfigProvider, message, theme } from 'antd'
import zhTW from 'antd/es/locale/zh_TW' // 繁體中文
import { MyLayout } from './components'
import { defaultThemeSet } from './constants'
import { settingStore } from './stores'
import 'antd/dist/reset.css'

const App = () => {
  const { setting } = settingStore()
  const [messageApi, contextHolder] = message.useMessage({
    top: 300
  })

  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: setting.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: defaultThemeSet(setting)
      }}
    >
      {contextHolder}
      <MyLayout messageApi={messageApi} />
    </ConfigProvider>
  )
}

export default App
