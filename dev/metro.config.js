const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add woff2 to asset extensions for font loading
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'woff2',
];

// Resolve streamdown-rn directly from source for immediate updates
// Point to the src directory - Metro will resolve index.ts automatically
config.resolver.extraNodeModules = {
  'streamdown-rn': path.resolve(__dirname, '../packages/streamdown-rn/src'),
};

// Ensure Metro can resolve TypeScript files
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'ts',
  'tsx',
];

// Blocklist nested dev directories to prevent recursive resolution
// Only block dev directories inside node_modules/streamdown-rn, not the current dev directory
config.resolver.blockList = [
  /.*\/node_modules\/streamdown-rn\/dev\/.*/,
  /.*\/node_modules\/streamdown-rn\/.*\/dev\/.*/,
];

// Ensure Metro watches the project root and streamdown-rn source
config.watchFolders = [
  path.resolve(__dirname),
  path.resolve(__dirname, '../packages/streamdown-rn/src'),
];

// Ensure Metro can resolve node_modules from the dev app when processing streamdown-rn source files
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
