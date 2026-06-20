module.exports = {
  root: true,
  extends: [require.resolve('@itqan/config/eslint.base.cjs')],
  env: { browser: true },
  ignorePatterns: ['.expo', 'dist', 'node_modules', 'expo-env.d.ts'],
};
