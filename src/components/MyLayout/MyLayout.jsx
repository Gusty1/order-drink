import { useEffect } from 'react'
import { Layout } from 'antd'
import MyHeader from '../MyHeader/MyHeader'
import MyContent from '../MyContent/MyContent'
import MyFooter from '../MyFooter/MyFooter'
import { setUser } from '../../services'

const MyLayout = ({ messageApi }) => {
  useEffect(() => {
    setUser()
  }, [])

  return (
    <Layout>
      <MyHeader />
      <MyContent messageApi={messageApi} />
      <MyFooter />
    </Layout>
  )
}
export default MyLayout
