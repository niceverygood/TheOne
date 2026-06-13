import { FAQS } from '@/components/landing/faq-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-one.kr';

/**
 * 랜딩 구조화 데이터(JSON-LD) — Organization · WebSite · FAQPage.
 * FAQPage 는 faq-data.ts 단일 출처를 그대로 사용(화면과 동기).
 * 검색 리치결과(FAQ 아코디언)·지식패널 후보를 노린다.
 */
export function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'THE ONE',
        alternateName: '더원',
        url: SITE_URL,
        description:
          '학력·재산·차량·부동산 4종 인증을 통과한 미혼 전문직을 위한 인증 기반 매칭 서비스.',
        image: `${SITE_URL}/opengraph-image`,
        parentOrganization: { '@type': 'Organization', name: '주식회사 바틀' },
        areaServed: 'KR',
        knowsLanguage: ['ko'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'THE ONE',
        inLanguage: 'ko-KR',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // 신뢰 가능한 정적 데이터(외부 입력 없음) — XSS 위험 없음.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
