module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["@babel/plugin-proposal-decorators", { "legacy": true }], // WatermelonDB requires this
      "react-native-worklets/plugin" // Reanimated v4 requires this
    ]
  };
};