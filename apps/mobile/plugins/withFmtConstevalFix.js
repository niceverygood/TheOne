// Expo config plugin: fmt 라이브러리 consteval 비활성화 (iOS).
//
// 최신 Xcode(16.x) + React Native(0.79, fmt 11.x) 조합에서, fmt 의 컴파일타임 포맷 검사
// (consteval)가 stricter clang 에서 "call to consteval function ... is not a constant
// expression" 으로 빌드를 깨뜨린다(glog/RCT-Folly 가 fmt 헤더를 컴파일).
//
// ⚠️ fmt 11.x 의 base.h 는 `FMT_USE_CONSTEVAL` 에 `#ifndef` 가드가 없어서, 빌드 설정으로
//    `-DFMT_USE_CONSTEVAL=0` 을 줘도 헤더가 무조건 재정의해 무시한다. 또한 Apple clang ≥14
//    부터 consteval 이 켜지므로 Xcode 다운그레이드로도 못 피한다(react-native-iap 12.x 는
//    최신 Xcode 필요).
//    → pod install 직후 fmt 헤더를 직접 패치해, FMT_USE_CONSTEVAL 을 강제로 0 으로 재정의한다.
//      (FMT_CONSTEVAL 이 empty 가 되어 consteval 생성자가 일반 함수로 폴백 → 런타임 포맷 처리)
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = 'withFmtConstevalFix_applied';
const SNIPPET = `
    # withFmtConstevalFix: fmt 헤더를 직접 패치해 consteval 강제 비활성 (Xcode 16 컴파일 에러 방지).
    # base.h 에 FMT_USE_CONSTEVAL #ifndef 가드가 없어 -D 정의는 안 먹으므로 소스를 직접 손본다.
    # fmt 는 RCT-Folly 의 전이 pod (CDN) → 설치 경로가 바뀌어도 잡도록 Pods 전체에서 glob.
    fmt_fix_count = 0
    fmt_fix_root = installer.sandbox.root.to_s
    fmt_fix_globs = [
      File.join(fmt_fix_root, '**', 'fmt', '*.h'),
      File.join(fmt_fix_root, 'fmt', 'include', 'fmt', '*.h'),
    ]
    fmt_fix_globs.flat_map { |g| Dir.glob(g) }.uniq.each do |fmt_fix_h|
      fmt_fix_src = File.read(fmt_fix_h)
      if fmt_fix_src.include?('#if FMT_USE_CONSTEVAL') && !fmt_fix_src.include?('${MARKER}')
        fmt_fix_src = fmt_fix_src.sub(
          '#if FMT_USE_CONSTEVAL',
          "// ${MARKER}\\n#undef FMT_USE_CONSTEVAL\\n#define FMT_USE_CONSTEVAL 0\\n#if FMT_USE_CONSTEVAL"
        )
        File.write(fmt_fix_h, fmt_fix_src)
        fmt_fix_count += 1
      end
    end
    Pod::UI.puts "[withFmtConstevalFix] patched #{fmt_fix_count} fmt header(s)"
`;

module.exports = function withFmtConstevalFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(MARKER)) {
        contents = contents.replace(/post_install do \|installer\|\n/, (m) => m + SNIPPET);
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
};
