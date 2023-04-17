const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './web-client/app.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/dist')
  },
  resolve: {
    modules: [
      "node_modules"
    ]
  },
  plugins: [
      new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery'
      })
  ]
};