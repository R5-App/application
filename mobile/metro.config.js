const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Override unstable_serverRoot to projectRoot (mobile/) so Metro resolves
// the entry file (./index.ts) from the correct directory, not from the
// npm workspace root (application/) which is auto-detected via package.json "workspaces".
config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};

// Varmistetaan, että Metro etsii moduuleja molemmista paikoista
config.watchFolders = [projectRoot, workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Lisätään selkeä polunmääritys aloitustiedostolle
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;