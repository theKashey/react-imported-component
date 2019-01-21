const path = require('path');

module.exports = function (node) {
  return {
    module: {
      rules: [
        {
          test: /\.js?$/,
          use: {
            loader: "babel-loader",
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['css-loader'],
          exclude: /node_modules/
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: "awesome-typescript-loader",
            options: {
              silent: process.argv.indexOf("--json") !== -1,
              useBabel: true,
              babelOptions: {
                plugins: node
                  ? [
                    "react-imported-component/babel",
                    "babel-plugin-dynamic-import-node"
                  ]
                  : ["react-imported-component/babel"]
              }
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.(jpg|jpeg|gif|png|ico)$/,
          exclude: /node_modules/,
          loader: "file-loader?name=img/[path][name].[ext]&context=./app/images"
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".css"],
      alias: {
        react: path.resolve(path.join(__dirname, './node_modules/react')),
        'babel-core': path.resolve(
          path.join(__dirname, './node_modules/@babel/core'),
        ),
      },
    },
    mode: "development"
  };
};
