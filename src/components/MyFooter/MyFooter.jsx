import { Layout } from 'antd'

const MyFooter = () => {
  const { Footer } = Layout

  return (
    <Footer style={{ textAlign: 'center', padding: '16px' }}>
      &copy;{new Date().getFullYear()} Created by Gray
    </Footer>
  )
}

export default MyFooter
