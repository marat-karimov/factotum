import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import * as webpack from "webpack";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),
  new webpack.ProvidePlugin({
    treejs: 'treejs/tree.js' // 'myLib' is the name of the library in your node_modules
  }),
];
