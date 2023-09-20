const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverage: true,
  collectCoverageFrom: ['src/*.js'],
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'lcov'],
  transform: {
    ...(config.transform || {}),
  },
}
