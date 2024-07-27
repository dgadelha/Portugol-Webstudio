/* eslint-disable */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  devtool: "source-map",
  output: {
    filename: "worker.js",
    path: path.resolve(__dirname, "lib"),
  },
  module: {
    rules: [
      {
        test: /\.js$/u,
        use: "babel-loader",
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};
