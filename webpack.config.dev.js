const path = require("path");
module.exports = {
  entry: "./src/main.ts",
  output: {
    filename: "[name].bundle.dev.user.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  devtool: "eval-cheap-module-source-map",
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
