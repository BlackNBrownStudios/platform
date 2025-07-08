// Custom Babel transformer for TypeScript interfaces
const babelJest = require('babel-jest').default;

module.exports = babelJest.createTransformer({
  presets: ['babel-preset-expo', '@babel/preset-typescript'],
  babelrc: false,
  configFile: false,
});
