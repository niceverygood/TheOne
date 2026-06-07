/**
 * 퍼널 애널리틱스 데이터 액세스 — 광고 유입→가입 전환 분석.
 *  - recordAnalyticsEvent: 이벤트 1건 append (web 서버/트랙 API에서 호출)
 *  - getFunnelOverview: 기간 전체 단계별 고유 방문자 수 + 단계 전환율
 *  - getFunnelByDimension: utm 차원(campaign/source/content/medium)별 퍼널
 *  - getFunnelDaily: 일별 단계 추이
 * 고유 방문자 기준은 COUNT(DISTINCT visitor_id). 같은 단계 중복 이벤트는 1명으로 집계.
 */
import { prisma } from './index';
import { Prisma, type FunnelEventType } from '@prisma/client';

/** 이벤트 1건 기록 입력(평탄화). web 측 recordEvent가 메타를 채워 호출. */
export interface RecordAnalyticsEventInput {
  type: FunnelEventType;
  visitorId: string;
  path?: string | null;
  referrer?: string | null;
  landing?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  fbclid?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  country?: string | null;
  meta?: Record<string, unknown> | null;
}

/** 퍼널 이벤트 1건 append. 실패는 호출부(web)에서 swallow. */
export async function recordAnalyticsEvent(input: RecordAnalyticsEventInput): Promise<void> {
  await prisma.analyticsEvent.create({
    data: {
      type: input.type,
      visitorId: input.visitorId,
      path: input.path ?? undefined,
      referrer: input.referrer ?? undefined,
      landing: input.landing ?? undefined,
      utmSource: input.utmSource ?? undefined,
      utmMedium: input.utmMedium ?? undefined,
      utmCampaign: input.utmCampaign ?? undefined,
      utmTerm: input.utmTerm ?? undefined,
      utmContent: input.utmContent ?? undefined,
      fbclid: input.fbclid ?? undefined,
      fbc: input.fbc ?? undefined,
      fbp: input.fbp ?? undefined,
      userAgent: input.userAgent ?? undefined,
      ipHash: input.ipHash ?? undefined,
      country: input.country ?? undefined,
      meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/** 퍼널 4단계 — 광고/유입 → 폼 노출 → 폼 시작 → 가입 성공. */
export interface FunnelOverview {
  pageView: number;
  waitlistView: number;
  waitlistStart: number;
  waitlistSuccess: number;
  /** 중복 가입 시도(이미 등록된 이메일) */
  waitlistDuplicate: number;
  /** 서버 오류로 실패한 제출 */
  waitlistError: number;
  /** 전체 방문→가입 전환율(%) */
  overallCvr: number;
}

interface FunnelCountRow {
  page_view: number;
  waitlist_view: number;
  waitlist_start: number;
  waitlist_success: number;
  waitlist_duplicate: number;
  waitlist_error: number;
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // 소수 1자리
}

/** 기간 전체 단계별 고유 방문자 수 + 전체 전환율. */
export async function getFunnelOverview(opts: { from: Date; to: Date }): Promise<FunnelOverview> {
  const rows = await prisma.$queryRaw<FunnelCountRow[]>`
    SELECT
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'page_view')::int          AS page_view,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_view')::int       AS waitlist_view,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_start')::int      AS waitlist_start,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_success')::int    AS waitlist_success,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_duplicate')::int  AS waitlist_duplicate,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_error')::int       AS waitlist_error
    FROM analytics_event
    WHERE created_at >= ${opts.from} AND created_at < ${opts.to}
  `;
  const r = rows[0] ?? {
    page_view: 0,
    waitlist_view: 0,
    waitlist_start: 0,
    waitlist_success: 0,
    waitlist_duplicate: 0,
    waitlist_error: 0,
  };
  return {
    pageView: r.page_view,
    waitlistView: r.waitlist_view,
    waitlistStart: r.waitlist_start,
    waitlistSuccess: r.waitlist_success,
    waitlistDuplicate: r.waitlist_duplicate,
    waitlistError: r.waitlist_error,
    overallCvr: pct(r.waitlist_success, r.page_view),
  };
}

export type FunnelDimension = 'utm_campaign' | 'utm_source' | 'utm_content' | 'utm_medium';

const DIMENSION_COLUMN: Record<FunnelDimension, string> = {
  utm_campaign: 'utm_campaign',
  utm_source: 'utm_source',
  utm_content: 'utm_content',
  utm_medium: 'utm_medium',
};

export interface FunnelByDimensionRow {
  dimension: string;
  pageView: number;
  waitlistView: number;
  waitlistStart: number;
  waitlistSuccess: number;
  cvr: number;
}

interface DimensionRawRow {
  dimension: string | null;
  page_view: number;
  waitlist_view: number;
  waitlist_start: number;
  waitlist_success: number;
}

/**
 * utm 차원별 퍼널. dimension은 화이트리스트로만 컬럼 주입(SQL injection 차단).
 * 가입 성공(waitlist_success) 내림차순 정렬, 상위 take개.
 */
export async function getFunnelByDimension(opts: {
  from: Date;
  to: Date;
  dimension: FunnelDimension;
  take?: number;
}): Promise<FunnelByDimensionRow[]> {
  const col = DIMENSION_COLUMN[opts.dimension];
  if (!col) throw new Error(`invalid dimension: ${opts.dimension}`);
  const column = Prisma.raw(col);
  const take = opts.take ?? 50;

  const rows = await prisma.$queryRaw<DimensionRawRow[]>`
    SELECT
      ${column} AS dimension,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'page_view')::int       AS page_view,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_view')::int    AS waitlist_view,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_start')::int   AS waitlist_start,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_success')::int AS waitlist_success
    FROM analytics_event
    WHERE created_at >= ${opts.from} AND created_at < ${opts.to}
    GROUP BY ${column}
    ORDER BY waitlist_success DESC, page_view DESC
    LIMIT ${take}
  `;

  return rows.map((r) => ({
    dimension: r.dimension ?? '(direct)',
    pageView: r.page_view,
    waitlistView: r.waitlist_view,
    waitlistStart: r.waitlist_start,
    waitlistSuccess: r.waitlist_success,
    cvr: pct(r.waitlist_success, r.page_view),
  }));
}

export interface FunnelDailyRow {
  date: string;
  pageView: number;
  waitlistView: number;
  waitlistStart: number;
  waitlistSuccess: number;
}

interface DailyRawRow {
  day: Date;
  page_view: number;
  waitlist_view: number;
  waitlist_start: number;
  waitlist_success: number;
}

/** 일별 단계 추이(고유 방문자). 빈 날짜는 0으로 메움. */
export async function getFunnelDaily(opts: { from: Date; to: Date }): Promise<FunnelDailyRow[]> {
  const rows = await prisma.$queryRaw<DailyRawRow[]>`
    SELECT
      date_trunc('day', created_at) AS day,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'page_view')::int       AS page_view,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_view')::int    AS waitlist_view,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_start')::int   AS waitlist_start,
      COUNT(DISTINCT visitor_id) FILTER (WHERE type = 'waitlist_success')::int AS waitlist_success
    FROM analytics_event
    WHERE created_at >= ${opts.from} AND created_at < ${opts.to}
    GROUP BY day
    ORDER BY day ASC
  `;

  const byDay = new Map<string, FunnelDailyRow>();
  const start = new Date(opts.from.getFullYear(), opts.from.getMonth(), opts.from.getDate());
  for (let d = new Date(start); d < opts.to; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, {
      date: key,
      pageView: 0,
      waitlistView: 0,
      waitlistStart: 0,
      waitlistSuccess: 0,
    });
  }
  for (const r of rows) {
    const key = r.day.toISOString().slice(0, 10);
    byDay.set(key, {
      date: key,
      pageView: r.page_view,
      waitlistView: r.waitlist_view,
      waitlistStart: r.waitlist_start,
      waitlistSuccess: r.waitlist_success,
    });
  }
  return [...byDay.values()];
}
