// Expo config plugin: react-native-iap Android 스토어 플레이버 고정.
//
// react-native-iap 는 안드로이드에서 product flavor 두 개(play / amazon)를 선언한다.
// 소비 측 앱이 어느 플레이버를 쓸지 지정하지 않으면 Gradle 이 :react-native-iap 의
// variant 를 못 고르고 빌드가 실패한다("cannot choose between amazonReleaseRuntimeElements
// / playReleaseRuntimeElements"). 우리는 Google Play 배포이므로 'play' 로 고정한다.
//
// 안드로이드는 CNG(android/ 미커밋 → EAS 가 prebuild)라서 app/build.gradle 의
// defaultConfig 에 missingDimensionStrategy 를 주입한다. iOS 는 커밋된 ios/ 를 쓰므로
// 이 플러그인(android 전용 mod)의 영향을 받지 않는다.
const { withAppBuildGradle } = require('expo/config-plugins');

const STRATEGY = "missingDimensionStrategy 'store', 'play'";

module.exports = function withIapStoreFlavor(config) {
  return withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes(STRATEGY)) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        (match) => `${match}\n        ${STRATEGY}`,
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });
};
