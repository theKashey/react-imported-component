const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  CheckerPlugin
} = require("awesome-typescript-loader");
const sharedConfig = require("./webpack-shared.config.js");

module.exports = {
  ...sharedConfig(true),
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
    fs: "empty",
    net: "empty"
  },
  entry: path.join(__dirname, "server", "index.ts"),
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist", "server")
  },
  plugins: [new CheckerPlugin()],
  devtool: "source-map"
};