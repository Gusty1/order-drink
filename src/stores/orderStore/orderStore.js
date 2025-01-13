import { create } from 'zustand'
import { getOrder } from '../../services/rethinkDB/rethinkDB'

// 訂單狀態管理
const orderStore = create((set) => ({
  order: null,
  resetOrder: () => {
    set({ order: null })
  },
  getOrder: async (id) => {
    const thisOrder = await getOrder(id)
    set({ order: thisOrder })
  }
}))

export default orderStore
