import { listWaitlist } from '@theone/db';

export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * 웨이팅리스트 CSV 내보내기. ip_hash·user_agent는 의도적으로 제외(개인정보 최소화).
 * Basic Auth 미들웨어가 접근을 보호한다.
 */
export async function GET() {
  const rows = await listWaitlist({ take: 100000 });
  const header = [
    'seq',
    'email',
    'gender',
    'job_category',
    'referral_code',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'created_at',
    'confirmed_at',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.seq,
        r.email,
        r.gender,
        r.jobCategory,
        r.referralCode,
        r.utmSource,
        r.utmMedium,
        r.utmCampaign,
        r.createdAt.toISOString(),
        r.confirmedAt?.toISOString() ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  const csv = '﻿' + lines.join('\n'); // BOM for Excel 한글
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="waitlist-${date}.csv"`,
    },
  });
}
