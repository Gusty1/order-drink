import { themeToken } from '../../styles'

const MyFooterStyle = () => {
  const { colorBgContainer } = themeToken()

  return {
    textAlign: 'center',
    backgroundColor: colorBgContainer
  }
}

export default MyFooterStyle
