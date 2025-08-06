// Jest configuration file
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!**/node_modules/**'
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"]
  }
};
