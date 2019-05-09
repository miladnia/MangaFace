const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './public/assets/scripts/src/FaceApp.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public/assets/scripts')
  },
  resolve: {
    modules: [
      path.join(__dirname, "public/assets/scripts/src"),
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