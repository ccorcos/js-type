var webpack = require("webpack")

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    app: [
      'webpack-hot-middleware/client',
      'src/index.js',
    ],
  },
  output: {
    path: __dirname + '/dist',
    filename: "bundle.js",
  },
  module: {
    // preLoaders: [
    //   { test: /\.js$/, loader: "eslint", exclude: /node_modules/ },
    // ],
    loaders: [
      { test: /\.js$/, loader: "babel", exclude: /node_modules/, query: { presets: ['es2015', 'react', 'stage-0'] } },
      { test: /\.scss$/, loader: "style!css!sass" },
      { test: /\.(svg|png|jpe?g|gif|ttf|woff2?|eot)$/, loader: 'url?limit=8182' },
    ]
  },
  resolve: {
    root: [
      __dirname,
      __dirname + '/src',
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  eslint: {
    formatter: require("eslint-friendly-formatter"),
  },
}
