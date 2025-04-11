const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push("db");
module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: ["js", "json", "ts", "tsx", "jsx", "mjs", "css","cjs"],
    blacklistRE: /#current-cloud-backend\/.*/,
  },
};
