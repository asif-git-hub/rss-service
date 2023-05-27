const path = require("path")

module.exports = {
  entry: {
    "feed-fetcher": "./src/handlers/feed.fetcher.ts",
  },
  mode: "production",
  target: "node",
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
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name]/index.js",
    path: path.resolve(__dirname, "build"),
    libraryTarget: "commonjs2",
  },
}
