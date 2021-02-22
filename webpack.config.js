const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: process.env.EXPOSE_MODULE ? 'index.js' : 'browser.js',
    library: {
      type: 'umd',
      name: 'formast-designer',
    },
    globalObject: 'window',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          "presets": [
            "@babel/preset-env",
            "@babel/preset-react"
          ],
          "plugins": [
            "@babel/plugin-proposal-class-properties",
            ["@babel/plugin-transform-runtime", { "regenerator": true }]
          ]
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      },
    ]
  },
  target: 'web',
  optimization: {
    minimize: !process.env.EXPOSE_MODULE,
    nodeEnv: process.env.NODE_ENV,
  },
  externals: process.env.EXPOSE_MODULE ? [nodeExternals()] : undefined,
}
