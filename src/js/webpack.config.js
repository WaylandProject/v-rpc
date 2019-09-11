
const path = require('path');

module.exports = mode => [{
  name: "v-rpc-ragemp-cef",
  mode,
  devtool: "",
  target: "web",
  entry: "./ragemp/cef/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist/ragemp/cef'),
    filename: `index.js`,
    library: '@eisengrind/v-rpc/ragemp/cef',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
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
  },
  plugins: []
}, {
  name: "v-rpc-ragemp-client",
  mode,
  devtool: "",
  target: "web",
  entry: "./ragemp/client/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist/ragemp/client'),
    filename: `index.js`,
    library: '@eisengrind/v-rpc/ragemp/client',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
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
  },
  plugins: []
}, {
  name: "v-rpc-ragemp-server",
  mode,
  devtool: "",
  target: "web",
  entry: "./ragemp/server/index.ts",
  output: {
    path: path.resolve(__dirname, 'dist/ragemp/server'),
    filename: `index.js`,
    library: '@eisengrind/v-rpc/ragemp/server',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
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
  },
  plugins: []
}];
