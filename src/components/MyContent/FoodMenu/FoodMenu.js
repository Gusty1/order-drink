import { useState } from 'react'
import { Image, Select } from 'antd'
import { storeNames, defaultSetting } from '../../../constants'

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
        disabled={defaultSetting.disabledMenu}
      />
      <Image
        width="100%"
        height="100%"
        src={storeNames.find((item) => item.value === storeMenu).url}
        style={{
          objectFit: 'contain'
        }}
        preview={{
          src: 'https://c.tenor.com/d-lz7Nu6X2oAAAAC/tenor.gif',
        }}
      />
    </>
  )
}

export default FoodMenu
