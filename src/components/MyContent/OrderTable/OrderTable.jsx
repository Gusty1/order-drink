import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Table, Button, Popconfirm } from 'antd'
import io from 'socket.io-client'
import { EditFilled, DeleteFilled } from '@ant-design/icons'
import { getTodayOrders, deleteOrder, getUser } from '../../../services'
import { orderStore, settingStore } from '../../../stores'
import './OrderTable.css'

/** 甜度/冰塊數值對應文字 */
const ICE_MAP = { 1: '正常', 2: '少冰', 3: '微冰', 4: '去冰', 5: '溫', 6: '熱' }
const SWEET_MAP = { 1: '正常', 2: '少糖', 3: '半糖', 4: '微糖', 5: '無糖' }

const OrderTable = ({ messageApi }) => {
  const [data, setData] = useState([])
  const { fetchOrder, order, resetOrder } = orderStore()
  const { setting } = settingStore()
  // H3 修復：getUser() 在元件頂層只讀取一次 localStorage
  const { drinkUser } = getUser() || {}
  // H2 修復：用 ref 持有最新的 order，讓 useEffect 閉包能讀到最新值
  const orderRef = useRef(order)
  useEffect(() => {
    orderRef.current = order
  }, [order])

  const editOrder = (id) => {
    fetchOrder(id)
  }

  const delOrder = async (id) => {
    try {
      const res = await deleteOrder(id)
      if (res.status === 200) {
        if (order?.data?.id === id) resetOrder()
        messageApi.success('刪除成功')
      } else {
        messageApi.error('刪除失敗，資料不存在')
      }
    } catch (e) {
      console.error('刪除飲料錯誤: ', e)
      messageApi.error('刪除失敗，請稍後再試')
    }
  }

  // H3 修復：columns 用 useMemo 包裹，只在 drinkUser 變動時重建
  const columns = useMemo(
    () => [
      {
        title: '稱呼',
        dataIndex: 'username',
        key: 'username',
        width: '12%'
      },
      {
        title: '飲品',
        dataIndex: 'drink',
        key: 'drink',
        width: '20%',
        ellipsis: true
      },
      {
        title: '冰塊',
        dataIndex: 'ice',
        key: 'ice',
        width: '8%',
        render: (val) => ICE_MAP[val] || '未知'
      },
      {
        title: '甜度',
        dataIndex: 'sweet',
        key: 'sweet',
        width: '8%',
        render: (val) => SWEET_MAP[val] || '未知'
      },
      {
        title: '備註',
        dataIndex: 'remark',
        key: 'remark',
        width: '20%',
        ellipsis: true
      },
      {
        title: '價格*數量',
        dataIndex: 'price',
        key: 'price',
        width: '15%',
        render: (price, record) => `${price}*${record.count}=${price * record.count}`,
        sorter: (a, b) => a.price * a.count - b.price * b.count
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'operate',
        width: '10%',
        render: (id, record) => {
          const show = record.drinkUser === drinkUser || drinkUser === 'root'
          return (
            <div
              style={{ display: 'flex', gap: 8, visibility: show ? 'visible' : 'hidden' }}
            >
              <Button
                type="primary"
                shape="circle"
                icon={<EditFilled />}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  editOrder(id)
                }}
              />
              <Popconfirm
                title="確定要刪除?"
                onConfirm={() => delOrder(id)}
                okText="是"
                cancelText="否"
              >
                <Button type="primary" shape="circle" icon={<DeleteFilled />} danger />
              </Popconfirm>
            </div>
          )
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drinkUser]
  )

  useEffect(() => {
    // 開發模式由 Vite proxy 轉發，生產模式前後端同源，不帶參數即連到同源
    const socket = io()

    const getData = async () => {
      const res = await getTodayOrders()
      const rows = res?.data?.data ?? []
      // H2 修復：透過 ref 讀取最新 order，避免 stale closure
      const currentOrder = orderRef.current
      if (currentOrder?.data?.id) {
        if (!rows.find((item) => item.id === currentOrder.data.id)) resetOrder()
      }
      setData(rows)
    }

    socket.on('tableChange', getData)
    getData()

    return () => {
      socket.off('tableChange', getData)
      socket.disconnect()
    }
  }, [resetOrder])

  const rowClassName = (record) => {
    if (record.id !== order?.data?.id) return ''
    return setting.darkMode ? 'selected-row-dark' : 'selected-row'
  }

  return (
    <Table
      tableLayout="fixed"
      columns={columns}
      dataSource={data}
      rowClassName={rowClassName}
      rowKey="id"
      footer={() => (
        <div style={{ textAlign: 'right', fontWeight: 600 }}>
          總計: {data.reduce((acc, cur) => acc + cur.price * cur.count, 0)}
        </div>
      )}
      bordered
      rowHoverable={false}
      pagination={false}
    />
  )
}

OrderTable.propTypes = {
  messageApi: PropTypes.object.isRequired
}

export default OrderTable
