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
// pnpm: 심볼릭 링크 해석을 위해 계층적 탐색 비활성
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
