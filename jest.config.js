module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.js$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg|ogg|mp3|wav)$': '<rootDir>/tests/__mocks__/assetMock.js',
  },
};
