/**
 * 직업 카테고리 — 남성 18개 / 여성 18개 (상위 전문직·고소득 중심).
 * 가입 심사 직업 선택 + Phase 1 웨이팅리스트 폼 + 검증 서류 매핑에 재사용.
 * 차별적 워딩 금지. 카테고리별 필수/선택 서류 묶음 포함.
 * ⚠️ apps/mobile/src/jobs.ts 와 id·라벨 동기화(모바일 미러).
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

const DOC_EMPLOY: JobDoc[] = [
  { label: '재직증명서', required: true },
  { label: '명함 / 사원증', required: true },
  { label: '자격·면허', required: false },
];
const DOC_LICENSE: JobDoc[] = [
  { label: '면허·자격증', required: true },
  { label: '재직증명서 / 개원 허가증', required: true },
  { label: '전문 자격증', required: false },
];
const DOC_OWNER: JobDoc[] = [
  { label: '사업자등록증', required: true },
  { label: '법인등기부등본 / 임원 재직증명', required: true },
  { label: '재무·매출 증빙', required: false },
];
const DOC_ACADEMIA: JobDoc[] = [
  { label: '임용증 / 재직증명서', required: true },
  { label: '학위증명서', required: true },
  { label: '명함', required: false },
];

export const MALE_JOB_CATEGORIES: JobCategory[] = [
  { id: 'legal', kr: '법조계', en: 'Legal', detail: '변호사·판사·검사', docs: DOC_LICENSE },
  { id: 'medical', kr: '의료계', en: 'Medical', detail: '의사·전문의·교수', docs: DOC_LICENSE },
  { id: 'dental', kr: '치과·한의', en: 'Dental·KM', detail: '치과의사·한의사', docs: DOC_LICENSE },
  { id: 'pharma', kr: '약사·제약', en: 'Pharma', detail: '약사·바이오', docs: DOC_LICENSE },
  {
    id: 'accounting',
    kr: '회계·세무·변리',
    en: 'Acc·Tax·IP',
    detail: 'CPA·세무사·변리사',
    docs: DOC_LICENSE,
  },
  { id: 'finance', kr: '금융', en: 'Finance', detail: '은행·증권·자산운용', docs: DOC_EMPLOY },
  { id: 'ibpe', kr: 'IB·PE·VC', en: 'Capital', detail: '투자은행·사모펀드·VC', docs: DOC_EMPLOY },
  { id: 'corporate', kr: '대기업', en: 'Corporate', detail: '재계 50위 과장급↑', docs: DOC_EMPLOY },
  {
    id: 'executive',
    kr: '임원·C레벨',
    en: 'Executive',
    detail: '대기업·외국계 임원',
    docs: DOC_OWNER,
  },
  { id: 'tech', kr: 'IT·테크', en: 'Tech', detail: '시니어 개발·CTO', docs: DOC_EMPLOY },
  {
    id: 'startup',
    kr: '창업·대표',
    en: 'Founder',
    detail: '스타트업 대표·공동창업',
    docs: DOC_OWNER,
  },
  {
    id: 'consulting',
    kr: '컨설팅',
    en: 'Consulting',
    detail: 'MBB·전략·M&A 자문',
    docs: DOC_EMPLOY,
  },
  { id: 'public', kr: '고위공직', en: 'Public', detail: '5급↑·법조 공무원', docs: DOC_EMPLOY },
  { id: 'diplomat', kr: '외교·국제', en: 'Global', detail: '외교관·국제기구', docs: DOC_EMPLOY },
  {
    id: 'professor',
    kr: '교수·연구',
    en: 'Academia',
    detail: '교수·국책연구·박사',
    docs: DOC_ACADEMIA,
  },
  {
    id: 'architect',
    kr: '건축·설계',
    en: 'Architecture',
    detail: '건축가·디렉터',
    docs: DOC_EMPLOY,
  },
  { id: 'pilot', kr: '전문기술', en: 'Specialist', detail: '파일럿·전문직', docs: DOC_LICENSE },
  { id: 'owner', kr: '사업가·자산가', en: 'Owner', detail: '연매출 30억↑·자산가', docs: DOC_OWNER },
];

export const FEMALE_JOB_CATEGORIES: JobCategory[] = [
  { id: 'medical', kr: '의료계', en: 'Medical', detail: '의사·치과·한의', docs: DOC_LICENSE },
  { id: 'pharma', kr: '약사·바이오', en: 'Pharma', detail: '약사·제약', docs: DOC_LICENSE },
  { id: 'law', kr: '법조계', en: 'Legal', detail: '변호사·판사·검사', docs: DOC_LICENSE },
  {
    id: 'professional',
    kr: '전문직',
    en: 'Professional',
    detail: '회계사·변리사·감정평가',
    docs: DOC_LICENSE,
  },
  {
    id: 'finance',
    kr: '금융·컨설팅',
    en: 'Finance',
    detail: '애널리스트·IB·컨설턴트',
    docs: DOC_EMPLOY,
  },
  {
    id: 'broadcast',
    kr: '방송·미디어',
    en: 'Broadcast',
    detail: '아나운서·기자·PD',
    docs: DOC_EMPLOY,
  },
  { id: 'arts', kr: '예술·문화', en: 'Arts', detail: '큐레이터·연주자·작가', docs: DOC_EMPLOY },
  {
    id: 'hospitality',
    kr: '항공·호텔',
    en: 'Hospitality',
    detail: '승무원·호텔리어·의전',
    docs: DOC_EMPLOY,
  },
  {
    id: 'academia',
    kr: '교수·연구',
    en: 'Academia',
    detail: '교수·연구원·박사',
    docs: DOC_ACADEMIA,
  },
  { id: 'teacher', kr: '교육', en: 'Education', detail: '교사·강사·교육기획', docs: DOC_EMPLOY },
  { id: 'fashion', kr: '패션·뷰티', en: 'Fashion', detail: '디자이너·MD·디렉터', docs: DOC_EMPLOY },
  {
    id: 'creator',
    kr: '인플루언서',
    en: 'Creator',
    detail: '콘텐츠·모델·크리에이터',
    docs: DOC_OWNER,
  },
  {
    id: 'marketing',
    kr: '마케팅·PR',
    en: 'Marketing',
    detail: 'CMO·브랜드·홍보',
    docs: DOC_EMPLOY,
  },
  {
    id: 'lifestyle',
    kr: 'F&B·라이프스타일',
    en: 'Lifestyle',
    detail: '셰프·소믈리에·공간기획',
    docs: DOC_EMPLOY,
  },
  { id: 'tech', kr: 'IT·테크', en: 'Tech', detail: 'PM·디자이너·창업', docs: DOC_EMPLOY },
  { id: 'global', kr: '외교·국제', en: 'Global', detail: '외교관·국제기구·NGO', docs: DOC_EMPLOY },
  {
    id: 'corporate',
    kr: '대기업·외국계',
    en: 'Corporate',
    detail: '대기업·외국계 전문직',
    docs: DOC_EMPLOY,
  },
  { id: 'owner', kr: '사업·임원', en: 'Owner', detail: '대표·C-level·자산가', docs: DOC_OWNER },
];

export function jobCategories(gender: Gender): JobCategory[] {
  return gender === 'male' ? MALE_JOB_CATEGORIES : FEMALE_JOB_CATEGORIES;
}

export const ALL_JOB_CATEGORY_IDS = [
  ...new Set([...MALE_JOB_CATEGORIES, ...FEMALE_JOB_CATEGORIES].map((c) => c.id)),
] as const;
