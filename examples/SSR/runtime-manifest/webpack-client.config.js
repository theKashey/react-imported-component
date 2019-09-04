const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  CheckerPlugin
} = require("awesome-typescript-loader");
const sharedConfig = require("./webpack-shared.config.js");

module.exports = {
  ...sharedConfig(false),
  entry: path.join(__dirname, "app", "client.tsx"),
  output: {
    // publicPath: "/dist",
    filename: "client.js",
    path: path.resolve(__dirname, "dist", "client"),
    chunkFilename: '[name].client.js',
  },
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      filename: path.resolve(__dirname, "dist", "client", "index.html"),
      template: path.resolve(__dirname, "app", "index.html")
    }),
    new CheckerPlugin()
  ],
  devtool: "source-map",
  devServer: {
    // open: true,
    content: path.join("/dist/client/")
    // dev: { publicPath: "/dist" }
  }
};