import { useEffect, useState } from 'react'
import { Button, Form, Input, Radio } from 'antd'
import { SendOutlined, CloseOutlined } from '@ant-design/icons'
import { getUser, setOrder } from '../../../services'
import { orderStore } from '../../../stores'

const OrderForm = ({ messageApi }) => {
  const [form] = Form.useForm() // 創建一個 Form 實例
  const { order, resetOrder } = orderStore()
  const [orderID, setOrderID] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (order?.data) {
      form.setFieldsValue(order.data)
      setOrderID(order.data.id)
    } else {
      setOrderID(null)
      form.resetFields()
    }
    //不把form加進依賴陣列，他又要警告我了
  }, [order, form])

  //送出表單
  const sendForm = async (data) => {
    try {
      setSending(true)
      const { drinkUser } = order?.data || getUser()
      const formData = {
        ...data,
        drinkUser,
        id: orderID ? orderID : null,
        price: data.price ? parseInt(data.price) : 0,
        date: new Date()
      }
      await setOrder(formData)
      resetOrder()
      form.resetFields()
      messageApi.success('送出成功')
    } catch (e) {
      console.error('送出飲料錯誤: ', e)
    } finally {
      setSending(false)
    }
  }

  return (
    <Form
      form={form}
      labelCol={{ span: 3 }}
      wrapperCol={{ span: 24 }}
      style={{ maxWidth: '100%' }}
      onFinish={(data) => sendForm(data)}
    >
      <Form.Item
        label="稱呼"
        name="username"
        rules={[
          {
            required: true,
            message: '必須輸入!!!'
          }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="飲品"
        name="drink"
        rules={[
          {
            required: true,
            message: '必須輸入!!!'
          }
        ]}
      >
        <Input placeholder="請輸入全名，不要造成訂購者的困擾" />
      </Form.Item>

      <Form.Item
        label="甜度"
        name="sweet"
        rules={[
          {
            required: true,
            message: '必須輸入!!!'
          }
        ]}
      >
        <Radio.Group>
          <Radio value={1}>正常</Radio>
          <Radio value={2}>少糖</Radio>
          <Radio value={3}>半糖</Radio>
          <Radio value={4}>微糖</Radio>
          <Radio value={5}>無糖</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="冰塊"
        name="ice"
        rules={[
          {
            required: true,
            message: '必須輸入!!!'
          }
        ]}
      >
        <Radio.Group>
          <Radio value={1}>正常</Radio>
          <Radio value={2}>少冰</Radio>
          <Radio value={3}>微冰</Radio>
          <Radio value={4}>去冰</Radio>
          <Radio value={5}>溫</Radio>
          <Radio value={6}>熱</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="數量"
        name="count"
        initialValue={1}
        rules={[
          {
            required: true,
            message: '必須輸入!!!'
          }
        ]}>
        <Input type="number" />
      </Form.Item>

      <Form.Item
        label="價格"
        name="price"
        initialValue=""
        rules={[
          {
            required: true,
            message: '必須輸入!!!'
          }
        ]}>
        <Input type="number" />
      </Form.Item>

      <Form.Item label="備註" name="remark" initialValue="">
        <Input.TextArea />
      </Form.Item>

      <Form.Item label="" style={{ textAlign: 'right' }}>
        <Button
          type="default"
          htmlType="button"
          icon={<CloseOutlined />}
          iconPlacement="start"
          color="gold"
          style={{ marginRight: '10px', display: orderID ? 'inline' : 'none' }}
          onClick={() => resetOrder()}
        >
          取消
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SendOutlined />}
          iconPlacement="start"
          disabled={sending}
        >
          送出
        </Button>
      </Form.Item>
    </Form>
  )
}

export default OrderForm
