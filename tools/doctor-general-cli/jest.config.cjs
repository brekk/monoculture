const config = require('../../shared/jest-config/jest.config')
module.exports = {
  ...config,
  collectCoverageFrom: ['!dist/**', '!fixture/**', '!coverage/**'],
}
