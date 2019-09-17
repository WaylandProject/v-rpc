
const path = require('path');
const ClosurePlugin = require('closure-webpack-plugin');

module.exports = mode => [{
  name: "v-rpc-ragemp-cef",
  mode,
  devtool: "",
  target: "web",
  entry: "./ragemp/cef/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist/ragemp/cef'),
    filename: `index.js`,
    library: 'vrpc',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  optimization: {
    minimize: true,
    minimizer: [
      new ClosurePlugin()
    ],
  },
  resolve: {
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"]
      }
    ]
  }
}, {
  name: "v-rpc-ragemp-client",
  mode,
  devtool: "",
  target: "web",
  entry: "./ragemp/client/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist/ragemp/client'),
    filename: `index.js`,
    library: 'vrpc',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  optimization: {
    minimize: true,
    minimizer: [
      new ClosurePlugin()
    ],
  },
  resolve: {
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"]
      }
    ]
  }
}, {
  name: "v-rpc-ragemp-server",
  mode,
  devtool: "",
  target: "web",
  entry: "./ragemp/server/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist/ragemp/server'),
    filename: `index.js`,
    library: 'vrpc',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  optimization: {
    minimize: true,
    minimizer: [
      new ClosurePlugin()
    ],
  },
  resolve: {
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"]
      }
    ]
  }
}];
