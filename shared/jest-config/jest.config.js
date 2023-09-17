module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageProvider: 'v8',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: [],
  globals: {
    'ts-jest': {
      tsconfig: '../monoculture-tsconfig/react-library.json',
    },
  },
}
