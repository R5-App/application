const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ignore build directories and kotlin compilation artifacts
config.resolver.blockList = [
  // Build directories
  /.*\/build\/.*/,
  /.*\/\.gradle\/.*/,
  
  // Kotlin build artifacts
  /.*\/classes\/kotlin\/.*/,
  
  // Gradle plugin build artifacts
  /.*gradle-plugin.*\/build\/.*/,
  
  // Other build artifacts
  /.*\/intermediates\/.*/,
  /.*\/outputs\/.*/,
  
  // Common ignore patterns
  /.*\/__tests__\/.*/,
];

// Watch folders configuration
config.watchFolders = [
  path.resolve(__dirname),
];

// Ignore patterns for the watcher
config.watcher = {
  ...config.watcher,
  additionalExts: ['cjs'],
  watchman: {
    ...config.watcher?.watchman,
    ignore_dirs: [
      'build',
      '.gradle',
      'intermediates',
      'outputs',
      'classes',
    ],
  },
};

module.exports = config;
