import { useState } from 'react'
import PropTypes from 'prop-types'
import { Layout, Divider, Modal, Input } from 'antd'
import FoodMenu from './FoodMenu/FoodMenu'
import OrderForm from './OrderForm/OrderForm'
import OrderTable from './OrderTable/OrderTable'
import { getEnv } from '../../utils/env'
import { getUser } from '../../services'
import './MyContent.css'

const MyContent = ({ messageApi }) => {
  const { Content } = Layout
  const env = getEnv()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')

  /** 雙擊標題：已是 root 就提示，否則打開密碼輸入框 */
  const handleDoubleClick = () => {
    const { drinkUser } = getUser() || {}
    if (drinkUser === 'root') {
      messageApi.info('目前已經是管理員')
      return
    }
    setOpen(true)
  }

  /** 密碼驗證 */
  const handleOk = () => {
    if (password === env.REACT_APP_ADMIN_PASSWORD) {
      localStorage.setItem('drinkUser', JSON.stringify({ drinkUser: 'root' }))
      messageApi.success('已切換為管理員，重新整理頁面')
      setOpen(false)
      setPassword('')
      setTimeout(() => window.location.reload(), 800)
    } else {
      messageApi.error('密碼錯誤')
    }
  }

  return (
    <Content className="contentContainer">
      <div className="titleContainer" onDoubleClick={handleDoubleClick}>
        {env.REACT_APP_TITLE}
      </div>
      <div className="topSection">
        <div className="menuSection">
          <FoodMenu storeName={env.REACT_APP_STORE_NAME} />
        </div>
        <div className="formSection">
          <OrderForm messageApi={messageApi} />
        </div>
      </div>
      <Divider />
      <OrderTable messageApi={messageApi} />

      <Modal
        title="管理員驗證"
        open={open}
        onOk={handleOk}
        onCancel={() => {
          setOpen(false)
          setPassword('')
        }}
        okText="確認"
        cancelText="取消"
      >
        <Input.Password
          autoFocus
          placeholder="請輸入管理員密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleOk}
        />
      </Modal>
    </Content>
  )
}

MyContent.propTypes = {
  messageApi: PropTypes.object.isRequired
}

export default MyContent
