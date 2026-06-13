import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-one.kr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /verify 는 내부 인증 현황(실데이터), /legal/terms·privacy 는 변호사 검토 전 초안 → 색인 제외
      disallow: ['/api/', '/admin', '/verify', '/legal/terms', '/legal/privacy'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
