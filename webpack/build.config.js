const path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipWebpackPlugin = require('zip-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const WebpackConfig = {

  // Disable source maps on production builds
  devtool: false,

  entry: {
    // Plugin entry points
    'control/content/JS/app': path.join(__dirname, '../src/control/content/JS/app.js'),
    // 'control/design/design': path.join(__dirname, '../src/control/design/design.js'),
    // 'control/settings/settings': path.join(__dirname, '../src/control/settings/settings.js'),
    'control/introduction/app': path.join(__dirname, '../src/control/introduction/app.js'),
    'control/strings/JS/app': path.join(__dirname, '../src/control/strings/JS/app.js'),
    'control/tests/app.test': path.join(__dirname, '../src/control/tests/app.test.js'),
    'widget/JS/app': path.join(__dirname, '../src/widget/JS/app.js'),
  },

  output: {
    path: path.join(__dirname, '../dist'),
    filename: '[name].js'
  },

  externals: {
    buildfire: 'buildfire'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: {loader: 'css-loader', options: {minimize: true}}
        })
      }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'control/content/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      template: path.join(__dirname, '../src/control/content/index.html'),
      chunks: ['control/content/JS/app']
    }),
    new HtmlWebpackPlugin({
      filename: 'control/introduction/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      template: path.join(__dirname, '../src/control/introduction/index.html'),
      chunks: ['control/introduction/app']
    }),
    new HtmlWebpackPlugin({
      filename: 'control/strings/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      template: path.join(__dirname, '../src/control/strings/index.html'),
      chunks: ['control/strings/JS/app']
    }),
    new HtmlWebpackPlugin({
      filename: 'control/tests/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      template: path.join(__dirname, '../src/control/tests/index.html'),
      chunks: ['control/tests/app.test']
    }),
    new HtmlWebpackPlugin({
      filename: 'widget/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
      template: path.join(__dirname, '../src/widget/index.html'),
      chunks: ['widget/JS/app']
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, '../src/control'),
      to: path.join(__dirname, '../dist/control'),
    }, {
      from: path.join(__dirname, '../src/widget'),
      to: path.join(__dirname, '../dist/widget'),
    }, {
      from: path.join(__dirname, '../src/resources'),
      to: path.join(__dirname, '../dist/resources'),
    }, {
      from: path.join(__dirname, '../plugin.json'),
      to: path.join(__dirname, '../dist/plugin.json'),
    }
    ], {
      ignore: ['*.js', '*.html', '*.md']
    }),
    new ExtractTextPlugin('[name].css'),
    new ZipWebpackPlugin({
      path: path.join(__dirname, '../'),
      filename: `plugin.zip`
    })
  ]

};

module.exports = WebpackConfig;
