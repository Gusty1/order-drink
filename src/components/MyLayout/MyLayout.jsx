import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { FloatButton, Layout } from 'antd'
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
      <FloatButton.BackTop visibilityHeight={300} />
    </Layout>
  )
}
MyLayout.propTypes = {
  messageApi: PropTypes.object.isRequired
}

export default MyLayout
