import { Layout, Divider } from 'antd'
import FoodMenu from './FoodMenu/FoodMenu'
import OrderForm from './OrderForm/OrderForm'
import OrderTable from './OrderTable/OrderTable'
import { settingStore } from '../../stores'
import './MyContent.css'

const MyContent = ({ messageApi }) => {
  const { Content } = Layout
  const { setting } = settingStore()
  const bgColor = setting.darkMode ? 'white' : 'black'

  return (
    <Content className="contentContainer">
      <div className="content">
        <div className="titleContainer">{process.env.REACT_APP_TITLE}</div>
        <div style={{ display: 'flex', gap: 10, maxHeight: '55vh', overflow: 'hidden' }}>
          <div style={{ flex: 1 }}>
            <FoodMenu storeName={process.env.REACT_APP_STORE_NAME} />
          </div>
          <div style={{ flex: 1 }}>
            <OrderForm messageApi={messageApi} />
          </div>
        </div>
        <Divider style={{ backgroundColor: bgColor }} />
        <div style={{ flex: 'flex', marginTop: 10 }}>
          <OrderTable messageApi={messageApi} />
        </div>
      </div>
    </Content>
  )
}

export default MyContent
