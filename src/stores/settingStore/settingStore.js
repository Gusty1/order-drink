import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultSetting } from '../../constants'

// 管理設定的 store
const settingStore = create(
  persist(
    (set) => ({
      setting: defaultSetting,
      darkModeChange: () =>
        set((state) => ({
          setting: {
            ...state.setting,
            darkMode: !state.setting.darkMode
          }
        }))
    }),
    { name: 'setting-storage' }
  )
)

export default settingStore
