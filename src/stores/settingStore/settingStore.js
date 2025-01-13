import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultSetting } from '../../constants'

// 管理設定的 store
const settingStore = create(
  persist((set) => ({
    setting: set?.setting ?? defaultSetting,
    darkModeChange: () =>
      set((state) => {
        return {
          setting: {
            ...state,
            darkMode: !state.setting.darkMode
          }
        }
      })
  }))
)

export default settingStore
