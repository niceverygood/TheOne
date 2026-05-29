// Expo + pnpm 모노레포 Metro 설정
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// .npmrc node-linker=hoisted 이므로 hierarchicalLookup은 기본값(true) 유지가 Expo 권장.

module.exports = config;
