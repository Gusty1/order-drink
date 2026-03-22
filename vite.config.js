import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_URL = 'http://localhost:5918'

/**
 * Vite plugin：開發模式啟動時，自動將 .env 的 REACT_APP_* 變數
 * 寫入 public/env.js，讓前端的 window._env_ 與 .env 保持同步
 */
function syncEnvPlugin() {
  return {
    name: 'sync-env-to-public',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, 'REACT_APP_')
      const envObj = Object.entries(env)
        .filter(([key]) => key.startsWith('REACT_APP_'))
        .map(([key, value]) => `  ${key}: "${value}"`)
        .join(',\n')

      const content = `// 由 vite plugin 自動產生，請勿手動修改\nwindow._env_ = {\n${envObj}\n};\n`
      fs.writeFileSync(path.resolve(config.root, 'public/env.js'), content, 'utf-8')
    }
  }
}

export default defineConfig({
  plugins: [react(), syncEnvPlugin()],
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom')
          ) {
            return 'vendor-react'
          }
          if (
            id.includes('node_modules/antd') ||
            id.includes('node_modules/@ant-design')
          ) {
            return 'vendor-antd'
          }
          if (id.includes('node_modules/socket.io-client')) {
            return 'vendor-socket'
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5917,
    proxy: {
      '/getTodayOrders': BACKEND_URL,
      '/setOrder': BACKEND_URL,
      '/getOrder': BACKEND_URL,
      '/deleteOrder': BACKEND_URL,
      '/socket.io': { target: BACKEND_URL, ws: true }
    }
  }
})
