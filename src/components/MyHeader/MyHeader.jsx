import { Layout, Switch } from 'antd'
import { MoonFilled, SunFilled } from '@ant-design/icons'
import { settingStore } from '../../stores'
import './MyHeader.css'

// L3: Header 是穩定的 Ant Design 元件，移至模組頂層解構，避免每次 render 重複解構
const { Header } = Layout

const MyHeader = () => {
  const { setting, darkModeChange } = settingStore()

  const handleReload = () => window.location.reload()

  return (
    <Header className="header">
      <button type="button" className="header-left" onClick={handleReload}>
        <img src="/favicon.ico" alt="logo" className="header-logo" />
        <span className="header-title">訂飲料</span>
      </button>
      <Switch
        checkedChildren={<MoonFilled />}
        unCheckedChildren={<SunFilled />}
        checked={setting.darkMode}
        onChange={darkModeChange}
      />
    </Header>
  )
}

export default MyHeader
