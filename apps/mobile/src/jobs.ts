/**
 * 직업 카테고리 — 남18/여18 (상위 전문직·고소득 중심).
 * packages/shared/src/job-categories.ts 의 모바일 미러(동일 id 유지 — AI/검증이 id로 조회).
 */
export interface Job {
  id: string;
  kr: string;
  en: string;
  detail: string;
}

export const MALE_JOBS: Job[] = [
  { id: 'legal', kr: '법조계', en: 'Legal', detail: '변호사·판사·검사' },
  { id: 'medical', kr: '의료계', en: 'Medical', detail: '의사·전문의·교수' },
  { id: 'dental', kr: '치과·한의', en: 'Dental·KM', detail: '치과의사·한의사' },
  { id: 'pharma', kr: '약사·제약', en: 'Pharma', detail: '약사·바이오' },
  { id: 'accounting', kr: '회계·세무·변리', en: 'Acc·Tax·IP', detail: 'CPA·세무사·변리사' },
  { id: 'finance', kr: '금융', en: 'Finance', detail: '은행·증권·자산운용' },
  { id: 'ibpe', kr: 'IB·PE·VC', en: 'Capital', detail: '투자은행·사모펀드·VC' },
  { id: 'corporate', kr: '대기업', en: 'Corporate', detail: '재계 50위 과장급↑' },
  { id: 'executive', kr: '임원·C레벨', en: 'Executive', detail: '대기업·외국계 임원' },
  { id: 'tech', kr: 'IT·테크', en: 'Tech', detail: '시니어 개발·CTO' },
  { id: 'startup', kr: '창업·대표', en: 'Founder', detail: '스타트업 대표·공동창업' },
  { id: 'consulting', kr: '컨설팅', en: 'Consulting', detail: 'MBB·전략·M&A 자문' },
  { id: 'public', kr: '고위공직', en: 'Public', detail: '5급↑·법조 공무원' },
  { id: 'diplomat', kr: '외교·국제', en: 'Global', detail: '외교관·국제기구' },
  { id: 'professor', kr: '교수·연구', en: 'Academia', detail: '교수·국책연구·박사' },
  { id: 'architect', kr: '건축·설계', en: 'Architecture', detail: '건축가·디렉터' },
  { id: 'pilot', kr: '전문기술', en: 'Specialist', detail: '파일럿·전문직' },
  { id: 'owner', kr: '사업가·자산가', en: 'Owner', detail: '연매출 30억↑·자산가' },
];

export const FEMALE_JOBS: Job[] = [
  { id: 'medical', kr: '의료계', en: 'Medical', detail: '의사·치과·한의' },
  { id: 'pharma', kr: '약사·바이오', en: 'Pharma', detail: '약사·제약' },
  { id: 'law', kr: '법조계', en: 'Legal', detail: '변호사·판사·검사' },
  { id: 'professional', kr: '전문직', en: 'Professional', detail: '회계사·변리사·감정평가' },
  { id: 'finance', kr: '금융·컨설팅', en: 'Finance', detail: '애널리스트·IB·컨설턴트' },
  { id: 'broadcast', kr: '방송·미디어', en: 'Broadcast', detail: '아나운서·기자·PD' },
  { id: 'arts', kr: '예술·문화', en: 'Arts', detail: '큐레이터·연주자·작가' },
  { id: 'hospitality', kr: '항공·호텔', en: 'Hospitality', detail: '승무원·호텔리어·의전' },
  { id: 'academia', kr: '교수·연구', en: 'Academia', detail: '교수·연구원·박사' },
  { id: 'teacher', kr: '교육', en: 'Education', detail: '교사·강사·교육기획' },
  { id: 'fashion', kr: '패션·뷰티', en: 'Fashion', detail: '디자이너·MD·디렉터' },
  { id: 'creator', kr: '인플루언서', en: 'Creator', detail: '콘텐츠·모델·크리에이터' },
  { id: 'marketing', kr: '마케팅·PR', en: 'Marketing', detail: 'CMO·브랜드·홍보' },
  { id: 'lifestyle', kr: 'F&B·라이프스타일', en: 'Lifestyle', detail: '셰프·소믈리에·공간기획' },
  { id: 'tech', kr: 'IT·테크', en: 'Tech', detail: 'PM·디자이너·창업' },
  { id: 'global', kr: '외교·국제', en: 'Global', detail: '외교관·국제기구·NGO' },
  { id: 'corporate', kr: '대기업·외국계', en: 'Corporate', detail: '대기업·외국계 전문직' },
  { id: 'owner', kr: '사업·임원', en: 'Owner', detail: '대표·C-level·자산가' },
];
