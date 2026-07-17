// Shared ESLint config for the whole workspace (TypeScript).
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, es2021: true, jest: true },
  ignorePatterns: ['**/dist/**', '**/node_modules/**', '*.js', '*.mjs'],
  rules: {
    // pragmatic for this sandbox; upgrades, not style, are the focus
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
