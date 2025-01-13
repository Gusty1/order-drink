import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    extends: [
      'eslint:recommended', // 預設的 ESLint 規則
      'plugin:react/recommended', // 使用 React 預設規則
      'plugin:prettier/recommended', // 整合 Prettier
    ],
  },
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
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  'plugin:react/jsx-runtime',
]
