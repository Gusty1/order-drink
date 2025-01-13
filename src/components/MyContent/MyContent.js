import { Layout, Divider } from 'antd'
import { reasonInfo } from '../../constants'
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
        <div className="titleContainer">{reasonInfo.title}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FoodMenu storeName={reasonInfo.storeName} />
          </div>
          <div style={{ flex: 1 }}>
            <OrderForm messageApi={messageApi}/>
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
