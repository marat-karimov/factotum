import type { Configuration } from "webpack";
import preprocess from "svelte-preprocess";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";
import path from "path";

rules.push(
  {
    test: /\.css$/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: {
          url: true,
        },
      },
    ],
  },
  {
    test: /\.svelte$/,
    exclude: /node_modules/,
    loader: "svelte-loader",
    options: {
      emitCss: true,
      hotReload: true,
      preprocess: preprocess(),
    },
  },
  {
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: "asset/resource",
    generator: {
      filename: "images/[hash][ext][query]",
    },
  }
);

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte/src/runtime"),
    },
    extensions: [".svelte", ".mjs", ".js", ".ts", ".jsx", ".tsx", ".css"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
};
