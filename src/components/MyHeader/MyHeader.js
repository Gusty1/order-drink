import React from 'react'
import { Layout, Switch } from 'antd'
import { MoonFilled, SunFilled } from '@ant-design/icons'
import { HeaderContainerStyle } from './MyHeaderStyle'
import { settingStore } from '../../stores'
import './MyHeader.css'

const MyHeader = () => {
  const { Header } = Layout
  const { setting, darkModeChange } = settingStore()

  return (
    <Header style={HeaderContainerStyle()}>
      <div className="heder-logo" onClick={() => window.location.reload()}></div>
      <div className="MenuContainer">
        <div>
          <Switch
            checkedChildren={<MoonFilled />}
            unCheckedChildren={<SunFilled />}
            checked={setting.darkMode ? true : false}
            onChange={darkModeChange}
          />
        </div>
      </div>
    </Header>
  )
}

export default MyHeader
