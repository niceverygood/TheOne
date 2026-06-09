// Expo config plugin: fmt 라이브러리 consteval 비활성화 (iOS).
//
// 최신 Xcode(16.x) + React Native 가 번들한 fmt 조합에서, fmt 의 컴파일타임 포맷 검사
// (consteval)가 stricter clang 에서 "call to consteval function ... is not a constant
// expression" 으로 빌드를 깨뜨린다(glog/RCT-Folly 가 fmt 헤더를 컴파일).
//
// react-native-iap 12.x 가 StoreKit appTransactionID 때문에 최신 Xcode 를 요구하므로
// Xcode 다운그레이드 대신, 모든 Pod 타깃에 FMT_USE_CONSTEVAL=0 을 주입해 consteval 경로를
// 끈다(런타임 포맷 처리로 폴백). iOS 는 CNG(prebuild)라 빌드 시 생성된 Podfile 을 패치.
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FLAG = 'FMT_USE_CONSTEVAL=0';
const SNIPPET = `
    # withFmtConstevalFix: fmt consteval 비활성 (Xcode 16 컴파일 에러 방지)
    installer.pods_project.targets.each do |fmt_fix_target|
      fmt_fix_target.build_configurations.each do |fmt_fix_config|
        fmt_fix_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        unless fmt_fix_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'].include?('${FLAG}')
          fmt_fix_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << '${FLAG}'
        end
      end
    end
`;

module.exports = function withFmtConstevalFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(FLAG)) {
        contents = contents.replace(/post_install do \|installer\|\n/, (m) => m + SNIPPET);
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
};
