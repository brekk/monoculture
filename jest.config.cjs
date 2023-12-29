const config = require('./shared/jest-config/jest.config')
module.exports = {
  ...config,
  projects: ['<rootDir>/packages/*', '<rootDir>/tools/*'],
}
