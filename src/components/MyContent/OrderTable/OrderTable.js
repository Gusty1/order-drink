import { useEffect, useState } from 'react'
import { Table, Button, Popconfirm } from 'antd'
import io from 'socket.io-client'
import { EditFilled, DeleteFilled } from '@ant-design/icons'
import { getTodayOrders, deleteOrder, getUser } from '../../../services'
import { orderStore } from '../../../stores'
import { defaultSetting } from '../../../constants'
import './OrderTable.css'

const socket = io(`http://${defaultSetting.rootIPAddress}:5000`) // 與後端 Socket.IO 連線

const OrderTable = ({ messageApi }) => {
  const [data, setData] = useState([])
  const { getOrder, order, resetOrder } = orderStore()
  const [orderID, setOrderID] = useState(null)

  const columns = [
    {
      title: '名稱',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '飲料',
      dataIndex: 'drink',
      key: 'drink'
    },
    {
      title: '冰塊',
      dataIndex: 'ice',
      key: 'ice',
      render: (iceNum) => {
        let showText = ''
        switch (iceNum) {
          case 1:
            showText = '正常'
            break
          case 2:
            showText = '少冰'
            break
          case 3:
            showText = '微冰'
            break
          case 4:
            showText = '去冰'
            break
          case 5:
            showText = '溫'
            break
          default:
            showText = '熱'
        }

        return <span>{showText}</span>
      }
    },
    {
      title: '甜度',
      dataIndex: 'sweet',
      key: 'sweet',
      render: (sweetNum) => {
        let showText = ''
        switch (sweetNum) {
          case 1:
            showText = '正常'
            break
          case 2:
            showText = '少糖'
            break
          case 3:
            showText = '半糖'
            break
          case 4:
            showText = '微糖'
            break
          default:
            showText = '無糖'
        }

        return <span>{showText}</span>
      }
    },
    {
      title: '備註',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '價格',
      dataIndex: 'price',
      key: 'price',
      sorter: {
        compare: (a, b) => a.price - b.price
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'operate',
      render: (id, all) => {
        const { drinkUser } = getUser()
        const show = all.drinkUser === drinkUser || drinkUser === 'root'
        return (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              visibility: show ? 'visible' : 'hidden'
            }}
          >
            <Button
              type="primary"
              shape="circle"
              icon={<EditFilled />}
              onClick={() => editOrder(id)}
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
  ]

  const editOrder = (id) => {
    getOrder(id)
  }
  const delOrder = (id) => {
    const delGo = async () => {
      await deleteOrder(id)
      if (order?.data.id === id) resetOrder()
    }
    delGo()
    messageApi.success('刪除成功')
  }

  useEffect(() => {
    const getData = async () => {
      const data = await getTodayOrders()
      setData(data.data.data)
    }

    const handleTableChange = (change) => {
      //接收到變化要做的事
      getData() // 呼叫異步方法
    }

    // 監聽 'tableChange' 事件
    socket.on('tableChange', handleTableChange)

    getData()

    // 清理函數，卸載時移除事件監聽
    return () => {
      socket.off('tableChange', handleTableChange)
    }
  }, [])

  useEffect(() => {
    if (order?.data) setOrderID(order?.data.id)
    else setOrderID(null)
  }, [order])

  const rowClassName = (record) => {
    return record.id === orderID ? 'selected-row' : ''
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowClassName={rowClassName}
      rowKey="id"
      footer={() => {
        return (
          <div style={{ textAlign: 'right' }}>
            總計: {data.reduce((acc, cur) => acc + cur.price, 0)}
          </div>
        )
      }}
      bordered
      rowHoverable={false}
      pagination={false}
    />
  )
}

export default OrderTable
