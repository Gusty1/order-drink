import { useState } from 'react'
import { Image, Select } from 'antd'
import { storeNames, storeMenuImages } from '../../../constants'

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
        disabled={true}
      />
      <Image
        width="100%"
        height='100%'
        src={storeMenuImages['store_' + storeMenu]}
        style={{
          objectFit: 'contain',
        }}
      />
    </>
  )
}

export default FoodMenu
