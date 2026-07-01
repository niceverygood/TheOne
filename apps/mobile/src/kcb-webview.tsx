import { useRef } from 'react';
import { Linking, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from './theme';

/**
 * KCB OkCert3 휴대폰 본인확인 WebView — 가입(step01)·로그인(login)이 공유한다.
 * 통신사 PASS 앱(intent://·앱스킴·유니버셜 링크)을 OS 로 넘겨 실행하고,
 * 인증 완료 후 /kcb/done 으로 이동하면 onDone() 을 한 번만 호출한다.
 */

// 통신사 PASS 앱 유니버셜 링크 호스트(iOS). WebView 안에서 열지 말고 OS로 넘겨 PASS 앱을 띄운다.
const PASS_UNIVERSAL_HOSTS = ['www.sktpass.com', 'fido.kt.com', 'fido.uplus.co.kr'];

function hostOf(url: string): string {
  return (url.replace(/^https?:\/\//i, '').split('/')[0] ?? '').toLowerCase();
}

// 안드로이드 intent:// URI 를 커스텀 스킴 URL 로 변환해 실행한다.
function launchAndroidIntent(url: string) {
  const hashIdx = url.indexOf('#Intent;');
  const meta = hashIdx >= 0 ? url.slice(hashIdx) : '';
  const scheme = meta.match(/scheme=([^;]+)/)?.[1];
  const pkg = meta.match(/package=([^;]+)/)?.[1];
  let body = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  let target = '';
  if (body.startsWith('intent://')) {
    body = body.slice('intent://'.length);
    target = scheme ? `${scheme}://${body}` : '';
  } else if (body.startsWith('intent:')) {
    target = body.slice('intent:'.length);
  } else {
    target = body;
  }
  const market = pkg ? `market://details?id=${pkg}` : undefined;
  if (target) {
    Linking.openURL(target).catch(() => {
      if (market) Linking.openURL(market).catch(() => {});
    });
  } else if (market) {
    Linking.openURL(market).catch(() => {});
  }
}

// 통신사 PASS 앱 실행: intent://(안드로이드)·앱스킴·유니버셜 링크를 OS로 넘긴다.
function openPassApp(url: string) {
  if (/^intent:/i.test(url)) {
    launchAndroidIntent(url);
    return;
  }
  Linking.openURL(url).catch(() => {});
}

// WebView 가 로드를 시도하기 전 호출 — KCB 페이지는 그대로 로드, 통신사 PASS 앱만 외부로.
function shouldLoadInWebView(url: string): boolean {
  if (/^https?:\/\//i.test(url)) {
    if (PASS_UNIVERSAL_HOSTS.includes(hostOf(url))) {
      openPassApp(url);
      return false;
    }
    return true;
  }
  openPassApp(url);
  return false;
}

/** KCB 인증창(전체 화면). 완료(/kcb/done) 감지 시 onDone() 1회 호출. */
export function KcbWebView({ url, onDone }: { url: string; onDone: () => void }) {
  const doneRef = useRef(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.ivory }}>
      <WebView
        source={{ uri: url }}
        originWhitelist={['*']}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(req) => shouldLoadInWebView(req.url)}
        onNavigationStateChange={(s) => {
          if (!doneRef.current && /\/kcb\/done\b/.test(s.url)) {
            doneRef.current = true;
            onDone();
          }
        }}
      />
    </View>
  );
}
