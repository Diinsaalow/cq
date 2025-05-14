module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './app',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      // Fix for react-native-appwrite DevMenu issue
      ['@babel/plugin-proposal-export-namespace-from'],
      ['react-native-reanimated/plugin'],
    ],
  };
};
