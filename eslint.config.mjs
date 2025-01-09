import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    ignores: ['node_modules'], // 忽略的檔案或目錄
  },
  {
    languageOptions: {
      ecmaVersion: 'latest', // 使用最新的 ECMAScript 語法
      sourceType: 'module', // 設定為 ES 模組
    },
    rules: {
      quotes: ['error', 'single'], // 強制使用單引號
      semi: ['error', 'never'], // 禁用分號
      'react/react-in-jsx-scope': 'off', // 關閉 JSX 需要引入 React 的規則
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  'plugin:react/jsx-runtime',
]
