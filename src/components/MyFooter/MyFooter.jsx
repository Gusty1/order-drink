import { Layout } from 'antd'

// L4: Footer 是穩定的 Ant Design 元件，移至模組頂層解構，避免每次 render 重複解構
const { Footer } = Layout

const MyFooter = () => {
  return (
    <Footer style={{ textAlign: 'center', padding: '16px' }}>
      &copy;{new Date().getFullYear()} Created by Gray
    </Footer>
  )
}

export default MyFooter
