const path = require('path');

module.exports = {
  mode: 'development',
  entry: './web-client/app.js',
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
