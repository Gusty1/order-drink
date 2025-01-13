import { useState } from 'react'
import { Image, Select } from 'antd'
import { storeNames } from '../../../constants'

const FoodMenu = ({ storeName }) => {
  const [storeMenu, setStoreMenu] = useState(null)

  useState(() => {
    setStoreMenu(storeName)
  }, [])

  const changeMenu = (menu) => {
    setStoreMenu(menu)
  }

  if (!storeMenu) return null

  return (
    <>
      <Select
        defaultValue={storeMenu}
        style={{ marginBottom: 10, width: '100%' }}
        onChange={(menu) => changeMenu(menu)}
        options={storeNames}
      />
      <Image
        width="100%"
        src={require(`../../../assets/images/storeMenus/${storeMenu}.png`)}
      />
    </>
  )
}

export default FoodMenu
