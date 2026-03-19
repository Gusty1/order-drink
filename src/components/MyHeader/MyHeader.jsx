import { Layout, Switch } from 'antd'
import { MoonFilled, SunFilled } from '@ant-design/icons'
import { settingStore } from '../../stores'
import './MyHeader.css'

const MyHeader = () => {
  const { Header } = Layout
  const { setting, darkModeChange } = settingStore()

  const handleReload = () => window.location.reload()

  return (
    <Header className="header">
      <button type="button" className="header-left" onClick={handleReload}>
        <div className="header-logo" />
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
