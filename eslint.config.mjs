import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }]
    }
  },
  {
    ignores: ['node_modules', 'build']
  }
]
