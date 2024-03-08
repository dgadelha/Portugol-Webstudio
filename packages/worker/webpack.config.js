/* eslint-disable */
const path = require("path");

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "production",
  entry: "./src/index.js",
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
};
