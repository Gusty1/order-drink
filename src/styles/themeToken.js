import { theme } from 'antd'

const themeToken = () => {
  const { token } = theme.useToken()
  return token
}

export default themeToken
