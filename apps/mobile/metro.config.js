// Expo + pnpm 모노레포 Metro 설정
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Expo 기본 watchFolders 를 보존하면서 모노레포 루트를 추가 (SDK 52 권장)
config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceRoot]));
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// .npmrc node-linker=hoisted 이므로 hierarchicalLookup은 기본값(true) 유지가 Expo 권장.

// ── React 단일 사본 강제 (모노레포 충돌 방지) ─────────────────────────────
// 모바일=react 19(SDK53), 루트(web/admin/shared)=react 18 이 공존 → Metro 가
// 번들에 두 버전을 섞어 "A React Element from an older version of React was
// rendered" 크래시 발생. react/react-dom 은 항상 모바일의 단일 사본으로만 해석.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react' ||
    moduleName === 'react-dom' ||
    moduleName.startsWith('react/') ||
    moduleName.startsWith('react-dom/')
  ) {
    try {
      return { type: 'sourceFile', filePath: require.resolve(moduleName, { paths: [projectRoot] }) };
    } catch {
      // 해석 실패 시 기본 resolver 로 폴백
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
