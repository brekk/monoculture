const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverageFrom: ['!fixture/**', '!coverage/**', '!**/__snapshots__/**'],
}
