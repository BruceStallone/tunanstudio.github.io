module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/hero-video.test.js'],
  moduleFileExtensions: ['js', 'mjs'],
  transform: {},
  setupFilesAfterEnv: [],
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
