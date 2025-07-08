const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

// Get the path to the shared directory
const sharedDir = path.resolve(__dirname, '../../shared');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // Additional configuration for SVG support
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  // Enhanced resolver configuration for PNPM symlinks
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    // Fix PNPM symlink resolution
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    // Enable symlink resolution
    symlinks: true,
    // Additional platforms for web support
    platforms: ['ios', 'android', 'web', 'native'],
    extraNodeModules: {
      'history-time-shared': path.resolve(sharedDir, 'src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  };

  // Add watchFolders to include the shared directory and root node_modules
  config.watchFolders = [sharedDir, path.resolve(__dirname, '../../node_modules')];

  return config;
})();
