import { Layout } from 'antd'
import MyFooterStyle from './MyFooterStyle'

const MyFooter = () => {
  const { Footer } = Layout

  return (
    <Footer style={MyFooterStyle()}>©{new Date().getFullYear()} Created by Gray</Footer>
  )
}
export default MyFooter
