import { create } from 'zustand'
import { getOrder } from '../../services/rethinkDB/rethinkDB'

// 訂單狀態管理
const orderStore = create((set) => ({
  order: null,
  resetOrder: () => {
    set({ order: null })
  },
  // M4: 加入 try/catch，避免 API 失敗時 promise reject 無人處理
  fetchOrder: async (id) => {
    try {
      const thisOrder = await getOrder(id)
      set({ order: thisOrder })
    } catch (error) {
      console.error('[fetchOrder] 取得訂單失敗:', error)
      set({ order: null })
    }
  }
}))

export default orderStore
