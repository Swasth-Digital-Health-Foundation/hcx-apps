const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "umd",
    library: "hcx-core",
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.png/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  externals: {
    react: "react",
    "react-avatar": {
      commonjs: "react-avatar",
      commonjs2: "react-avatar",
      amd: "react-avatar",
      root: "Avatar",
    },
    "@ant-design/icons": {
      commonjs: "@ant-design/icons",
      commonjs2: "@ant-design/icons",
      amd: "@ant-design/icons",
      root: "AntDesignIcons",
    },
    "html5-qrcode":{
      commonjs: "html5-qrcode",
      commonjs2: "html5-qrcode",
      amd: "html5-qrcode",
      root: "Html5QrcodeScanner",
    },
    "react-router-dom":{
      commonjs: "react-router-dom",
      commonjs2: "react-router-dom",
      amd: "react-router-dom",
      root: "ReactRouterDom",
    }
  }
};
