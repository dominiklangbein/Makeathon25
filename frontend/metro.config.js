// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withShareExtension } = require('expo-share-extension/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Hier wird die Share Extension eingebunden
module.exports = withShareExtension(config, {
  isCSSEnabled: true, // optional, für Web-Support (kannst auch false oder weglassen)
  resolver: {
    extraNodeModules: {
      // Hier fügst du ggf. native Module hinzu
      'react-native-linear-gradient': require.resolve('react-native-linear-gradient'),
    },
  },
});
