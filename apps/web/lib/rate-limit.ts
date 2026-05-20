/**
 * 메모리 기반 슬라이딩 윈도우 rate limit (Phase 1).
 * 멀티 인스턴스/서버리스에서는 한계가 있으므로 Phase 2+ Upstash Redis로 교체 예정.
 */
type Hit = { count: number; resetAt: number };

const WINDOW_MS = 60_000;
const MAX_HITS = 3;
const MAX_KEYS = 5000;

const store = new Map<string, Hit>();

export function rateLimit(key: string, max = MAX_HITS, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const hit = store.get(key);

  if (!hit || hit.resetAt < now) {
    // LRU 단순 방어: 용량 초과 시 가장 오래된 키 제거
    if (store.size >= MAX_KEYS) {
      const oldest = store.keys().next().value;
      if (oldest) store.delete(oldest);
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (hit.count >= max) return false;
  hit.count += 1;
  return true;
}
