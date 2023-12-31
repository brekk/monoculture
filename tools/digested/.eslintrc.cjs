module.exports = {
  root: true,
  extends: ['monoculture'],
  overrides: [
    {
      files: ['autotests/*'],
      rules: {
        'max-len': 0,
      },
    },
  ],
}
