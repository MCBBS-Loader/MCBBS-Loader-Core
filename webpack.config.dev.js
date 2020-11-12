const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
module.exports = {
  devtool: "eval-cheap-module-source-map",
  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      entryOnly: true,
      banner: fs
        .readFileSync(path.resolve(__dirname, "./src/libs/ushead.js"))
        .toString(),
    }),
  ],
  entry: "./src/main.ts",
  output: {
    filename: "[name].bundle.dev.user.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
