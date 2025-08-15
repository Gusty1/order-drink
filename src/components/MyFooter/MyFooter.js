import { Layout } from 'antd'
import MyFooterStyle from './MyFooterStyle'

const MyFooter = () => {
  const { Footer } = Layout

  return (
    <Footer style={MyFooterStyle()}>&copy;{new Date().getFullYear()} Created by Gusty</Footer>
  )
}
export default MyFooter
