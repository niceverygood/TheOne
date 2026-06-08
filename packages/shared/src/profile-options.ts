/**
 * 가입 설문 옵션 단일 출처 — 모바일 가입 화면 / web 검증 / AI 자기소개 생성이 공유한다.
 * 라벨은 한국어 표기, 값(value)은 영문 슬러그로 저장(스키마 안정성).
 */
import type { Gender } from './job-categories';

export interface Option {
  value: string;
  label: string;
}

/** 시·도 (사는지역 / 활동지역) */
export const REGIONS: Option[] = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'incheon', label: '인천' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'daejeon', label: '대전' },
  { value: 'gwangju', label: '광주' },
  { value: 'ulsan', label: '울산' },
  { value: 'sejong', label: '세종' },
  { value: 'gangwon', label: '강원' },
  { value: 'chungbuk', label: '충북' },
  { value: 'chungnam', label: '충남' },
  { value: 'jeonbuk', label: '전북' },
  { value: 'jeonnam', label: '전남' },
  { value: 'gyeongbuk', label: '경북' },
  { value: 'gyeongnam', label: '경남' },
  { value: 'jeju', label: '제주' },
  { value: 'overseas', label: '해외' },
];

/** 취미 (다중선택). '기타'는 자유 입력으로 보강(value=etc). */
export const HOBBIES: Option[] = [
  { value: 'travel', label: '여행' },
  { value: 'fitness', label: '운동·헬스' },
  { value: 'golf', label: '골프' },
  { value: 'tennis', label: '테니스' },
  { value: 'hiking', label: '등산' },
  { value: 'cooking', label: '요리' },
  { value: 'wine', label: '와인' },
  { value: 'coffee', label: '커피·카페' },
  { value: 'reading', label: '독서' },
  { value: 'movie', label: '영화·드라마' },
  { value: 'music', label: '음악·공연' },
  { value: 'art', label: '전시·미술' },
  { value: 'photo', label: '사진' },
  { value: 'pet', label: '반려동물' },
  { value: 'game', label: '게임' },
  { value: 'drive', label: '드라이브' },
  { value: 'investing', label: '재테크·투자' },
  { value: 'language', label: '외국어' },
  { value: 'volunteer', label: '봉사활동' },
  { value: 'etc', label: '기타' },
];

/** 음주 빈도 */
export const DRINKING_FREQUENCY: Option[] = [
  { value: 'none', label: '전혀 안 함' },
  { value: 'rarely', label: '가끔' },
  { value: 'sometimes', label: '주 1~2회' },
  { value: 'often', label: '주 3회 이상' },
  { value: 'enjoy', label: '즐기는 편' },
];

/** 주량 */
export const DRINKING_AMOUNT: Option[] = [
  { value: 'none', label: '못 마심' },
  { value: 'light', label: '소주 반병' },
  { value: 'medium', label: '소주 1병' },
  { value: 'heavy', label: '소주 2병 이상' },
];

/** 흡연 */
export const SMOKING: Option[] = [
  { value: 'none', label: '비흡연' },
  { value: 'quitting', label: '금연 중' },
  { value: 'sometimes', label: '가끔' },
  { value: 'yes', label: '흡연' },
];

/** 체형 — 남/여 분기 (남녀 특성에 맞는 보기) */
export const BODY_TYPES: Record<Gender, Option[]> = {
  male: [
    { value: 'slim', label: '슬림' },
    { value: 'normal', label: '보통' },
    { value: 'athletic', label: '근육질·탄탄' },
    { value: 'sturdy', label: '듬직한' },
    { value: 'chubby', label: '통통' },
  ],
  female: [
    { value: 'slim', label: '슬림' },
    { value: 'normal', label: '보통' },
    { value: 'glamorous', label: '글래머' },
    { value: 'toned', label: '탄탄한' },
    { value: 'chubby', label: '통통' },
  ],
};

/** 키 입력 범위 (cm) */
export const HEIGHT_RANGE = { min: 140, max: 200 } as const;

/** value → label 헬퍼 (저장된 슬러그를 표기로 복원) */
export function optionLabel(options: Option[], value?: string | null): string | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value === value)?.label;
}
