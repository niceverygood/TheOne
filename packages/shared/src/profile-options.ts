/**
 * 가입 설문 옵션 단일 출처 — 모바일 가입 화면 / web 검증 / AI 자기소개 생성이 공유한다.
 * 라벨은 한국어 표기, 값(value)은 영문 슬러그로 저장(스키마 안정성).
 */
import type { Gender } from './job-categories';

export interface Option {
  value: string;
  label: string;
}

/** 시·도 (지역 1단계) */
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

/**
 * 지역 2단계 — 시도 선택 후 세부 지역(구/권역). 없는 시도(세종·해외)는 시도값 그대로 저장.
 * 저장 값 형식: `시도.세부` (예: seoul.gangnam). 표기는 regionLabel().
 */
export const REGION_SUBS: Record<string, Option[]> = {
  seoul: [
    { value: 'seoul.gangnam', label: '강남구' },
    { value: 'seoul.seocho', label: '서초구' },
    { value: 'seoul.songpa', label: '송파구' },
    { value: 'seoul.gangdong', label: '강동구' },
    { value: 'seoul.seongdong', label: '성동구' },
    { value: 'seoul.gwangjin', label: '광진구' },
    { value: 'seoul.yongsan', label: '용산구' },
    { value: 'seoul.junggu', label: '중구' },
    { value: 'seoul.jongno', label: '종로구' },
    { value: 'seoul.mapo', label: '마포구' },
    { value: 'seoul.seodaemun', label: '서대문구' },
    { value: 'seoul.eunpyeong', label: '은평구' },
    { value: 'seoul.yeongdeungpo', label: '영등포구' },
    { value: 'seoul.dongjak', label: '동작구' },
    { value: 'seoul.gwanak', label: '관악구' },
    { value: 'seoul.geumcheon', label: '금천구' },
    { value: 'seoul.guro', label: '구로구' },
    { value: 'seoul.yangcheon', label: '양천구' },
    { value: 'seoul.gangseo', label: '강서구' },
    { value: 'seoul.dongdaemun', label: '동대문구' },
    { value: 'seoul.jungnang', label: '중랑구' },
    { value: 'seoul.seongbuk', label: '성북구' },
    { value: 'seoul.gangbuk', label: '강북구' },
    { value: 'seoul.dobong', label: '도봉구' },
    { value: 'seoul.nowon', label: '노원구' },
  ],
  gyeonggi: [
    { value: 'gyeonggi.south', label: '경기 남부' },
    { value: 'gyeonggi.north', label: '경기 북부' },
    { value: 'gyeonggi.east', label: '경기 동부' },
    { value: 'gyeonggi.west', label: '경기 서부' },
    { value: 'gyeonggi.seongnam', label: '성남·분당' },
    { value: 'gyeonggi.pangyo', label: '판교' },
    { value: 'gyeonggi.suwon', label: '수원' },
    { value: 'gyeonggi.yongin', label: '용인' },
    { value: 'gyeonggi.goyang', label: '고양·일산' },
    { value: 'gyeonggi.anyang', label: '안양·과천' },
    { value: 'gyeonggi.bucheon', label: '부천' },
    { value: 'gyeonggi.gwangmyeong', label: '광명' },
    { value: 'gyeonggi.hanam', label: '하남·미사' },
    { value: 'gyeonggi.namyangju', label: '남양주' },
    { value: 'gyeonggi.uijeongbu', label: '의정부' },
  ],
  incheon: [
    { value: 'incheon.songdo', label: '송도' },
    { value: 'incheon.yeonsu', label: '연수구' },
    { value: 'incheon.bupyeong', label: '부평구' },
    { value: 'incheon.namdong', label: '남동구' },
    { value: 'incheon.seogu', label: '서구·청라' },
    { value: 'incheon.gyeyang', label: '계양구' },
    { value: 'incheon.michuhol', label: '미추홀구' },
    { value: 'incheon.junggu', label: '중·동구' },
  ],
  busan: [
    { value: 'busan.haeundae', label: '해운대구' },
    { value: 'busan.suyeong', label: '수영구' },
    { value: 'busan.busanjin', label: '서면·부산진' },
    { value: 'busan.namgu', label: '남구' },
    { value: 'busan.dongnae', label: '동래구' },
    { value: 'busan.yeonje', label: '연제구' },
    { value: 'busan.gangseo', label: '강서구' },
    { value: 'busan.gijang', label: '기장군' },
  ],
  daegu: [
    { value: 'daegu.suseong', label: '수성구' },
    { value: 'daegu.junggu', label: '중구' },
    { value: 'daegu.dalseo', label: '달서구' },
    { value: 'daegu.donggu', label: '동구' },
    { value: 'daegu.bukgu', label: '북구' },
    { value: 'daegu.dalseong', label: '달성군' },
  ],
  daejeon: [
    { value: 'daejeon.yuseong', label: '유성구' },
    { value: 'daejeon.seogu', label: '서구' },
    { value: 'daejeon.junggu', label: '중구' },
    { value: 'daejeon.donggu', label: '동구' },
    { value: 'daejeon.daedeok', label: '대덕구' },
  ],
  gwangju: [
    { value: 'gwangju.seogu', label: '서구' },
    { value: 'gwangju.namgu', label: '남구' },
    { value: 'gwangju.bukgu', label: '북구' },
    { value: 'gwangju.donggu', label: '동구' },
    { value: 'gwangju.gwangsan', label: '광산구' },
  ],
  ulsan: [
    { value: 'ulsan.namgu', label: '남구' },
    { value: 'ulsan.junggu', label: '중구' },
    { value: 'ulsan.donggu', label: '동구' },
    { value: 'ulsan.bukgu', label: '북구' },
    { value: 'ulsan.ulju', label: '울주군' },
  ],
  gangwon: [
    { value: 'gangwon.chuncheon', label: '춘천' },
    { value: 'gangwon.wonju', label: '원주' },
    { value: 'gangwon.gangneung', label: '강릉' },
    { value: 'gangwon.sokcho', label: '속초·동해' },
  ],
  chungbuk: [
    { value: 'chungbuk.cheongju', label: '청주' },
    { value: 'chungbuk.chungju', label: '충주' },
    { value: 'chungbuk.etc', label: '그 외' },
  ],
  chungnam: [
    { value: 'chungnam.cheonan', label: '천안·아산' },
    { value: 'chungnam.dangjin', label: '당진·서산' },
    { value: 'chungnam.etc', label: '그 외' },
  ],
  jeonbuk: [
    { value: 'jeonbuk.jeonju', label: '전주' },
    { value: 'jeonbuk.gunsan', label: '군산·익산' },
    { value: 'jeonbuk.etc', label: '그 외' },
  ],
  jeonnam: [
    { value: 'jeonnam.yeosuncheon', label: '여수·순천' },
    { value: 'jeonnam.mokpo', label: '목포' },
    { value: 'jeonnam.etc', label: '그 외' },
  ],
  gyeongbuk: [
    { value: 'gyeongbuk.pohang', label: '포항' },
    { value: 'gyeongbuk.gumi', label: '구미' },
    { value: 'gyeongbuk.gyeongju', label: '경주·안동' },
    { value: 'gyeongbuk.etc', label: '그 외' },
  ],
  gyeongnam: [
    { value: 'gyeongnam.changwon', label: '창원' },
    { value: 'gyeongnam.gimhae', label: '김해·양산' },
    { value: 'gyeongnam.jinju', label: '진주' },
    { value: 'gyeongnam.etc', label: '그 외' },
  ],
  jeju: [
    { value: 'jeju.jejusi', label: '제주시' },
    { value: 'jeju.seogwipo', label: '서귀포시' },
  ],
};

/** 지역 저장값(시도 또는 시도.세부) → 표기 라벨. 예: seoul.gangnam → "서울 강남구" */
export function regionLabel(value?: string | null): string | undefined {
  if (!value) return undefined;
  const sido = REGIONS.find((r) => r.value === value);
  if (sido) return sido.label; // 시도만 선택
  const dot = value.indexOf('.');
  if (dot > 0) {
    const sidoVal = value.slice(0, dot);
    const parent = REGIONS.find((r) => r.value === sidoVal);
    const sub = (REGION_SUBS[sidoVal] ?? []).find((s) => s.value === value);
    if (parent && sub) return `${parent.label} ${sub.label}`;
    if (parent) return parent.label;
  }
  return value;
}

/** 취미 (다중선택). '기타'는 자유 입력으로 보강(value=etc). */
export const HOBBIES: Option[] = [
  { value: 'travel', label: '여행' },
  { value: 'camping', label: '캠핑·글램핑' },
  { value: 'golf', label: '골프' },
  { value: 'tennis', label: '테니스' },
  { value: 'hiking', label: '등산' },
  { value: 'running', label: '러닝·마라톤' },
  { value: 'fitness', label: '헬스·PT' },
  { value: 'yoga', label: '요가·필라테스' },
  { value: 'swimming', label: '수영' },
  { value: 'ski', label: '스키·보드' },
  { value: 'surfing', label: '서핑·수상레저' },
  { value: 'climbing', label: '클라이밍' },
  { value: 'cycling', label: '자전거' },
  { value: 'drive', label: '드라이브' },
  { value: 'wine', label: '와인' },
  { value: 'whisky', label: '위스키·바' },
  { value: 'coffee', label: '커피·카페' },
  { value: 'cooking', label: '요리·베이킹' },
  { value: 'foodie', label: '미식·맛집 탐방' },
  { value: 'reading', label: '독서' },
  { value: 'movie', label: '영화·드라마' },
  { value: 'music', label: '음악·공연' },
  { value: 'art', label: '전시·미술' },
  { value: 'performance', label: '뮤지컬·공연' },
  { value: 'photo', label: '사진' },
  { value: 'pet', label: '반려동물' },
  { value: 'game', label: '게임' },
  { value: 'investing', label: '재테크·투자' },
  { value: 'realestate', label: '부동산' },
  { value: 'language', label: '외국어' },
  { value: 'selfdev', label: '자기계발' },
  { value: 'meditation', label: '명상·마음챙김' },
  { value: 'fashion', label: '패션·쇼핑' },
  { value: 'craft', label: '공예·그림' },
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

/** 흡연 */
export const SMOKING: Option[] = [
  { value: 'none', label: '비흡연' },
  { value: 'quitting', label: '금연 중' },
  { value: 'sometimes', label: '가끔' },
  { value: 'yes', label: '흡연' },
  { value: 'ecig', label: '전자담배' },
];

/** 체형 — 남/여 분기 (남녀 특성에 맞는 보기) */
export const BODY_TYPES: Record<Gender, Option[]> = {
  male: [
    { value: 'slim', label: '슬림' },
    { value: 'slim_fit', label: '슬림탄탄' },
    { value: 'normal', label: '보통' },
    { value: 'athletic', label: '탄탄한·근육질' },
    { value: 'fit', label: '운동하는' },
    { value: 'sturdy', label: '듬직한' },
    { value: 'tall', label: '장신·큰 키' },
    { value: 'chubby', label: '통통' },
  ],
  female: [
    { value: 'slim', label: '슬림' },
    { value: 'slim_fit', label: '슬림탄탄' },
    { value: 'normal', label: '보통' },
    { value: 'glamorous', label: '글래머' },
    { value: 'voluptuous', label: '볼륨감 있는' },
    { value: 'fit', label: '탄탄한·운동하는' },
    { value: 'petite', label: '아담한' },
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
