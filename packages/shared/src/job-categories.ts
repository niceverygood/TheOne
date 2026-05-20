/**
 * 직업 카테고리 — 남성 11개 / 여성 13개.
 * 가입 심사 직업 선택 + Phase 1 웨이팅리스트 폼 + 검증 서류 매핑에 재사용.
 * 차별적 워딩 금지. 카테고리별 필수/선택 서류 묶음 포함.
 */

export type Gender = 'male' | 'female';

export interface JobDoc {
  label: string;
  required: boolean;
}

export interface JobCategory {
  /** 안정적 식별자 (DB 저장값) */
  id: string;
  /** 한글 라벨 */
  kr: string;
  /** 영문 보조 라벨 */
  en: string;
  /** 세부 직군 */
  detail: string;
  /** 제출 서류 (required=필수, false=선택) */
  docs: JobDoc[];
}

export const MALE_JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'legal',
    kr: '법조계',
    en: 'Legal',
    detail: '변호사·판사·검사·법무관',
    docs: [
      { label: '변협 등록증', required: true },
      { label: '재직증명서', required: true },
      { label: '명함', required: false },
    ],
  },
  {
    id: 'medical',
    kr: '의료계',
    en: 'Medical',
    detail: '의사·치과의사·한의사·약사',
    docs: [
      { label: '의사 면허증', required: true },
      { label: '재직증명서 / 개원 허가증', required: true },
      { label: '전문의 자격증', required: false },
    ],
  },
  {
    id: 'accounting',
    kr: '회계·세무·변리',
    en: 'Acc·Tax·IP',
    detail: 'CPA·세무사·변리사·관세사',
    docs: [
      { label: '자격증', required: true },
      { label: '재직증명서', required: true },
    ],
  },
  {
    id: 'corporate',
    kr: '대기업',
    en: 'Corporate',
    detail: '재계 50위 그룹사·과장급 이상',
    docs: [
      { label: '재직증명서(직급 표기)', required: true },
      { label: '사원증 / 명함', required: true },
      { label: '원천징수영수증', required: false },
    ],
  },
  {
    id: 'finance',
    kr: '금융',
    en: 'Finance',
    detail: '은행·증권·자산운용·VC·PE',
    docs: [
      { label: '재직증명서', required: true },
      { label: '투자상담사 · CFA 자격증', required: false },
    ],
  },
  {
    id: 'tech',
    kr: 'IT·테크',
    en: 'Tech',
    detail: '시니어 개발자·CTO·테크 임원·창업자',
    docs: [
      { label: '재직증명서 / 사업자등록증', required: true },
      { label: '사원증', required: true },
      { label: 'GitHub · 특허', required: false },
    ],
  },
  {
    id: 'public',
    kr: '공직',
    en: 'Public',
    detail: '5급 이상 행정·외무·법조 공무원',
    docs: [
      { label: '재직증명서(직급 명시)', required: true },
      { label: '합격증 사본', required: false },
    ],
  },
  {
    id: 'architecture',
    kr: '건축·디자인',
    en: 'Architecture',
    detail: '건축가·도시설계·인테리어 디렉터',
    docs: [
      { label: '건축사 자격증 / 재직증명서', required: true },
      { label: '대표 프로젝트 PDF', required: false },
    ],
  },
  {
    id: 'consulting',
    kr: '컨설팅',
    en: 'Consulting',
    detail: 'MBB·전략 컨설팅·M&A 자문',
    docs: [
      { label: '재직증명서', required: true },
      { label: '명함', required: true },
      { label: '학위증명서', required: false },
    ],
  },
  {
    id: 'academia',
    kr: '학계·연구',
    en: 'Academia',
    detail: '교수·국책 연구원·박사',
    docs: [
      { label: '재직증명서', required: true },
      { label: '학위증명서', required: true },
      { label: '논문 리스트', required: false },
    ],
  },
  {
    id: 'founder',
    kr: '사업·임원',
    en: 'Founder',
    detail: '대표·C-level·임원(연매출 30억 이상)',
    docs: [
      { label: '사업자등록증', required: true },
      { label: '임원 재직증명', required: true },
      { label: '법인등기부등본', required: false },
    ],
  },
];

export const FEMALE_JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'professional',
    kr: '전문직',
    en: 'Professional',
    detail: '의사·약사·변호사·회계사·세무사',
    docs: [
      { label: '면허증 · 자격증', required: true },
      { label: '재직증명서', required: true },
    ],
  },
  {
    id: 'broadcast',
    kr: '방송·미디어',
    en: 'Broadcast',
    detail: '아나운서·기자·PD·작가',
    docs: [
      { label: '소속사 재직증명', required: true },
      { label: '출연 이력', required: true },
      { label: '사원증', required: false },
    ],
  },
  {
    id: 'arts',
    kr: '예술·문화',
    en: 'Arts',
    detail: '큐레이터·연주자·갤러리스트·시각예술 작가',
    docs: [
      { label: '전시·공연 이력 PDF', required: true },
      { label: '소속 증명', required: true },
      { label: '학위증명서', required: false },
    ],
  },
  {
    id: 'hospitality',
    kr: '항공·호텔',
    en: 'Hospitality',
    detail: '승무원·호텔리어·MICE 매니저·의전',
    docs: [
      { label: '재직증명서', required: true },
      { label: '사원증 / ID 카드', required: true },
    ],
  },
  {
    id: 'education',
    kr: '교육·연구',
    en: 'Academia',
    detail: '교수·교사·국책 연구원·박사과정',
    docs: [
      { label: '재직증명서', required: true },
      { label: '학위증명서', required: true },
      { label: '논문 리스트', required: false },
    ],
  },
  {
    id: 'fashion',
    kr: '패션·뷰티',
    en: 'Fashion',
    detail: '디자이너·MD·브랜드 디렉터·바이어',
    docs: [
      { label: '재직증명서', required: true },
      { label: '매체 노출 포트폴리오', required: true },
      { label: '명함', required: false },
    ],
  },
  {
    id: 'creator',
    kr: '인플루언서·크리에이터',
    en: 'Creator',
    detail: 'IG·유튜브 콘텐츠·모델·디지털 크리에이터',
    docs: [
      { label: '채널 본인 인증', required: true },
      { label: '인사이트·팔로워 검증', required: true },
      { label: 'MCN 정산서', required: false },
    ],
  },
  {
    id: 'marketing',
    kr: '마케팅·PR',
    en: 'Marketing',
    detail: 'CMO·브랜드 매니저·홍보 디렉터·광고 기획',
    docs: [
      { label: '재직증명서', required: true },
      { label: '명함', required: true },
      { label: '캠페인 포트폴리오', required: false },
    ],
  },
  {
    id: 'lifestyle',
    kr: 'F&B·라이프스타일',
    en: 'Lifestyle',
    detail: '셰프·소믈리에·바리스타·공간 기획자',
    docs: [
      { label: '자격증 / 재직증명서', required: true },
      { label: '사업자등록증', required: true },
      { label: '매체 노출', required: false },
    ],
  },
  {
    id: 'tech',
    kr: 'IT·테크',
    en: 'Tech',
    detail: '프로덕트 매니저·디자이너·테크 창업자',
    docs: [
      { label: '재직증명서 / 사업자등록증', required: true },
      { label: '포트폴리오', required: false },
    ],
  },
  {
    id: 'finance',
    kr: '금융·컨설팅',
    en: 'Finance',
    detail: '애널리스트·IB·컨설턴트',
    docs: [
      { label: '재직증명서', required: true },
      { label: '자격증', required: false },
    ],
  },
  {
    id: 'global',
    kr: '외교·국제',
    en: 'Global',
    detail: '외교관·국제기구·NGO 디렉터',
    docs: [
      { label: '재직증명서', required: true },
      { label: '학위증명서', required: false },
    ],
  },
  {
    id: 'founder',
    kr: '사업·임원',
    en: 'Founder',
    detail: '대표·C-level·공동대표',
    docs: [
      { label: '사업자등록증', required: true },
      { label: '임원 재직증명', required: true },
      { label: '법인등기부등본', required: false },
    ],
  },
];

export function jobCategories(gender: Gender): JobCategory[] {
  return gender === 'male' ? MALE_JOB_CATEGORIES : FEMALE_JOB_CATEGORIES;
}

export const ALL_JOB_CATEGORY_IDS = [
  ...new Set([...MALE_JOB_CATEGORIES, ...FEMALE_JOB_CATEGORIES].map((c) => c.id)),
] as const;
