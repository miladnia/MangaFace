const path = require('path');

module.exports = {
  mode: 'development',
  entry: './web-client/main.js',
  output: {
    filename: 'app_bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  resolve: {
    modules: [
      "node_modules"
    ]
  }
};
