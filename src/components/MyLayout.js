import React from 'react'
import { Layout, Menu, theme } from 'antd'
const { Header, Content, Footer } = Layout
const items = new Array(3).fill(null).map((_, index) => ({
  key: index + 1,
  label: `nav ${index + 1}`,
}))

const MyLayout = () => {
  const {
    token: { colorBgContainer, colorBgLayout },
  } = theme.useToken()

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colorBgLayout,
        }}
      >
        <div className="demo-logo">訂飲料</div>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            minWidth: 0,
          }}
        />
      </Header>
      <Content
        style={{
          padding: '0 48px',
          backgroundColor: colorBgLayout,
        }}
      >
        <div
          style={{
            minHeight: 280,
            padding: 24,
            backgroundColor: colorBgContainer,
          }}
        >
          Content
        </div>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          backgroundColor: colorBgLayout,
        }}
      >
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  )
}
export default MyLayout
