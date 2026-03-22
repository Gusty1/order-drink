import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    settings: {
      react: { version: 'detect' }
    },
    plugins: {
      'react-hooks': pluginReactHooks
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }]
    }
  },
  {
    ignores: ['node_modules', 'build']
  }
]
