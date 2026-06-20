/**
 * Shared ESLint base config for the Itqān monorepo.
 * Consumed by packages/apps via `extends: ['@itqan/config/eslint.base.cjs']`.
 */
module.exports = {
  root: false,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    es2023: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'smart'],
    // Static assets (fonts, images, audio) are loaded via Metro's require().
    '@typescript-eslint/no-require-imports': [
      'error',
      { allow: ['\\.(png|jpe?g|gif|svg|ttf|otf|woff2?|mp3|wav)$'] },
    ],
  },
  ignorePatterns: ['dist', 'node_modules', '.expo', '.turbo', 'coverage', '*.cjs'],
};
