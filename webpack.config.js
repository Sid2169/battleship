// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',  // cache-busting
    publicPath: '/battleship/',  // serve from the GitHub Pages project subpath
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
      // Images (ship sprites) - inline small assets, emit larger files
      { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset' },
      // Audio (music and sound effects) - always emit to dist
      { test: /\.(ogg|mp3|wav|m4a)$/i, type: 'asset/resource' },
    ],
  },
  mode: argv.mode || 'development',
});