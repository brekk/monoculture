module.exports = {
  root: true,
  extends: ['monoculture'],
  overrides: [
    {
      files: ['autotests/*'],
      rules: {
        'unused-imports/no-unused-vars': 0,
        '@typescript-eslint/no-unused-vars': 0,
        'import/no-duplicates': 0,
      },
    },
  ],
}
