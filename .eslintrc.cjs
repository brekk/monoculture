module.exports = {
  root: true,
  // see packages/eslint-config-custom
  extends: ['custom'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
  rules: {
    'jest/expect-expect': 'off',
  },
}
