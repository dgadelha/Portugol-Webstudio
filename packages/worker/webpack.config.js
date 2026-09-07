/* eslint-disable */
const path = require("path");
const fs = require("fs");
const MinimizerPlugin = require("minimizer-webpack-plugin");

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  devtool: "source-map",
  output: {
    clean: true,
    filename: isCI ? "worker.[contenthash].js" : "worker.js",
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
      new MinimizerPlugin({
        minimizerOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.done.tap("GenerateWorkerManifest", stats => {
          const assets = stats.toJson().assetsByChunkName;
          const workerFileName = assets?.main[0];

          const fileContent = `export const WORKER_FILE_NAME = '${workerFileName}';\n`;
          fs.writeFileSync(path.resolve(__dirname, "lib/worker-manifest.ts"), fileContent);
        });
      },
    },
  ],
};
