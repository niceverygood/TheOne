/**
 * AI 스튜디오 비동기 클라이언트 — 백그라운드 생성 + 완료 푸시.
 * start 로 잡을 만들고 jobId 를 받은 뒤, result 를 폴링(또는 푸시 후)해서 결과를 받는다.
 * 앱을 닫아도 서버가 끝까지 생성하므로, 복귀 후 폴링만으로도 결과를 수신할 수 있다.
 */
import { Platform } from 'react-native';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : '');

export interface StudioImage {
  style: string;
  b64: string;
  mime?: string;
}

export type StudioStartResult =
  | { ok: true; jobId: string }
  | { ok: false; reason: 'not_configured' | 'rate_limit' | 'too_large' | 'server' | string };

export type StudioPollResult =
  | { status: 'pending' }
  | { status: 'done'; images: StudioImage[] }
  | { status: 'failed' | 'not_found' };

/** 생성 시작 — 리사이즈된 이미지 URI + 선택 장면 + (선택) 푸시 토큰. jobId 반환. */
export async function startPhotoStudio(
  uploadUri: string,
  styleIds: string[],
  pushToken?: string | null,
): Promise<StudioStartResult> {
  if (!API_BASE) return { ok: false, reason: 'server' };
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await fetch(uploadUri).then((r) => r.blob());
    form.append('image', blob, 'photo.jpg');
  } else {
    // RN FormData 파일 파트 — 타입 정의에 없어 캐스팅
    form.append('image', {
      uri: uploadUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }
  form.append('styles', styleIds.join(','));
  if (pushToken) form.append('pushToken', pushToken);

  try {
    const res = await fetch(`${API_BASE}/api/ai/photo-studio/start`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.ok && data.jobId) return { ok: true, jobId: data.jobId as string };
    return { ok: false, reason: (data?.reason as string) ?? 'server' };
  } catch {
    return { ok: false, reason: 'server' };
  }
}

/** 잡 상태 폴링. done 이면 서버가 결과를 돌려주고 즉시 삭제하므로, 받은 즉시 반영해야 한다. */
export async function pollPhotoStudio(jobId: string): Promise<StudioPollResult> {
  if (!API_BASE) return { status: 'failed' };
  try {
    const res = await fetch(
      `${API_BASE}/api/ai/photo-studio/result?jobId=${encodeURIComponent(jobId)}`,
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) return { status: 'pending' }; // 일시 오류 → 다음 폴링에 재시도
    if (data.status === 'done')
      return { status: 'done', images: (data.images ?? []) as StudioImage[] };
    if (data.status === 'pending') return { status: 'pending' };
    return { status: data.status === 'failed' ? 'failed' : 'not_found' };
  } catch {
    return { status: 'pending' };
  }
}
