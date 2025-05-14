const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Resolve DevMenu conflict in react-native-appwrite
defaultConfig.resolver.extraNodeModules = {
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
};

// Add any file extensions here
defaultConfig.resolver.assetExts.push('pem');

module.exports = defaultConfig;
