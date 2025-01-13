import { themeToken } from '../../styles'

export const HeaderContainerStyle = () => {
  const { colorBgContainer } = themeToken()

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colorBgContainer
  }
}
