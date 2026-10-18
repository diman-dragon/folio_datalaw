// ESLint: catches undefined names and unused imports (the contract checks only verify import paths).
import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['www/vendor/**', 'src-tauri/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['www/js/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser } },
    rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }], 'no-undef': 'error' },
  },
  {
    files: ['www/js/**/*.test.js', 'scripts/**/*.mjs', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
