module.exports = function (api) {
  api.cache(true);
  return {
    // unstable_transformImportMeta: zustand v5 등 ESM 의존성의 import.meta 가
    // 웹 dev 번들(클래식 스크립트)에서 SyntaxError 를 내며 앱 전체가 빈 화면이 된다.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
  };
};
