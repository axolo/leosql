var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js'
  },
  optimization: {
    minimize: true
  }
}
