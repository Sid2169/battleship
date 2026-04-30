// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',  // cache-busting
    clean: true,
  },
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/index.html' }),
  ],
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/,  exclude: /node_modules/, use: 'babel-loader' },
    ],
  },
  mode: argv.mode || 'development',
});