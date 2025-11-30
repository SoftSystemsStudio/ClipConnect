module.exports = [
  // ignore generated and external files
  { ignores: ['**/.next/**', 'node_modules/**'] },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      // Run Prettier as an ESLint rule and report formatting issues as errors
      'prettier/prettier': ['error', require('./.prettierrc')],
    },
  },
]
