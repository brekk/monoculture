const config = require('../../packages/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverage: true,
  collectCoverageFrom: ['src/*.js', '!src/index.js'],
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'lcov'],
  transform: {
    ...(config.transform || {}),
  },
}
