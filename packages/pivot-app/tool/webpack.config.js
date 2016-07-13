'use strict' // eslint-disable-line

// const path = require('path')
// const _root = path.resolve()

const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const postcss = () => [
//   require('postcss-calc'),
//   require('postcss-nesting'),
//   require('postcss-css-variables'),
//   require('autoprefixer')
// ]
const postcss = (webpack) => [
  require('postcss-import')({ addDependencyTo: webpack }),
  require('postcss-calc'),
  require('postcss-nesting'),
  require('postcss-apply'),
  require('postcss-css-variables'),
  require('postcss-font-awesome'),
  require('autoprefixer')
];

const commonPlugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.ProvidePlugin({
    h: 'snabbdom/h'
  })
]

const clientConfig = {
  amd: false,
  progress: true,
  devtool: 'source-map',
  node: { fs: 'empty' },
  entry: {
    client: [
      './src/client/entry.js',
      'font-awesome-webpack!./src/shared/font-awesome.config.js',
    ],
  },
  output: {
    path: './build/public',
    publicPath: '/',
    filename: 'clientBundle.js', //during development
    // filename: 'clientBundle_[hash:6].js',
  },
  module: {
    loaders: [...commonLoadersWithPresets(['es2015', 'stage-0', 'react'])],
    noParse: [],
  },
  resolve: {
    alias: {},
  },
  postcss,
  plugins: [...commonPlugins,
    new AssetsPlugin({
      path: './build',
    }),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
    }),
    /* new HtmlWebpackPlugin({
      title: 'My Awesome App',
      template: './src/share/index.html',
      // filename: './src/share/index.html'
    }),*/
  ],
}

const serverConfig = {
  progress: true,
  devtool: 'source-map',
  entry: {
    server: ['./src/server/entry.js'],
  },
  target: 'node',
  output: {
    path: './build/server',
    filename: 'serverBundle.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: [...commonLoadersWithPresets(['es2015', 'stage-0', 'react'])], // can use node5 instead of es2015 when uglify-js can handle es6
  },
  postcss,
  plugins: [...commonPlugins,
    new webpack.DefinePlugin({
      __CLIENT__: false,
      __SERVER__: true,
    }),
  ],
  externals: [/^[@a-z][a-z\/\.\-0-9]*$/i, // native modules will be excluded, e.g require('react/server')
    /^.+assets\.json$/i, // these assets produced by assets-webpack-plugin
  ],
  node: {
    console: true,
    __filename: true,
    __dirname: true,
  },
}


/**
 * Cordova
 */

const cordovaConfig = {
  entry: {
    client: ['./src/client/entry.js'],
  },
  output: {
    path: './cordova/www/build',
    publicPath: '/',
    filename: 'cordovaBundle.js',
  },
  module: {
    loaders: [...commonLoadersWithPresets(['es2015', 'stage-0', 'react'])],
    noParse: [],
  },
  resolve: {
    alias: {},
  },
  postcss,
  plugins: [...commonPlugins,
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __CORDOVA__: true,
    }),
    /*new HtmlWebpackPlugin({
      title: 'My Awesome App',
      template: './src/share/index.html',
      // filename: './src/share/index.html'
    }),*/
  ],
}

// copy static assets
const shelljs = require('shelljs')
shelljs.mkdir('-p', clientConfig.output.path)
shelljs.cp('-rf', './src/static/', clientConfig.output.path)

const argv = process.argv[2]
if (argv === 'all' || argv === 'cordovaOnly') {
  shelljs.mkdir('-p', cordovaConfig.output.path)
  shelljs.cp('-rf', './src/static/', cordovaConfig.output.path)
}

module.exports = { clientConfig, serverConfig, cordovaConfig }


function commonLoadersWithPresets(presets) {
  return [{
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      loader: 'babel',
      query: {
        presets: presets.map((preset) => require.resolve(`babel-preset-${preset}`)),
        plugins: [require.resolve('babel-snabbdom-jsx'),
                  require.resolve('babel-plugin-transform-runtime')],
        cacheDirectory: true, // cache into OS temp folder by default
      }
    }, {
      test: /\.json$/,
      loader: 'json',
    },
    { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
    { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
    {
      // match everything except js, jsx, json, css, scss, less. You can add more
      test: /\.(?!(jsx?|json|s?css|less|woff|ttf|eot|svg|html?)$)([^.]+$)/,
      loader: 'url?limit=10000&name=[name]_[hash:6].[ext]',
    }
  ]
}
