import { create } from 'zustand';

/** AI 자기소개 섹션(편집 가능). 키는 @theone/shared INTRO_SECTIONS 와 동일. */
export type IntroSections = {
  about?: string;
  idealType?: string;
  lifestyle?: string;
  datingStyle?: string;
  weekend?: string;
};

/** 가입 진행 상태 (Zustand) — 본인인증 → 사진 → 키 → 지역 → 직업·학교 → 취미 → 라이프스타일 → 자기소개 */
export interface SignupState {
  // Step 01 본인인증
  verified: boolean;
  name?: string;
  birth?: string;
  gender: 'male' | 'female';
  phone?: string;
  // Step 02 사진 — 선택한 이미지 로컬 URI 목록(첫 장이 대표). 실제 S3 업로드는 별도 단계.
  photos: string[];
  photoCount: number;
  // Step 03 키
  height?: number;
  // Step 04 지역
  residenceRegion?: string;
  activityRegion?: string;
  // Step 05 직업·학교
  jobCategory?: string;
  school?: string;
  // Step 06 취미
  hobbies: string[];
  hobbyEtc?: string;
  // Step 07 라이프스타일
  drinkingFrequency?: string;
  drinkingAmount?: string;
  smoking?: string;
  bodyType?: string;
  // Step 08 자기소개(AI 생성 + 편집)
  introSections?: IntroSections;
  // 추천인(선택)
  referralCode?: string;
  // 본인인증 봉인 토큰 (가입 제출 시 서버로 전달 → ciHash 저장)
  idToken?: string;
  // 가입 제출 후 서버가 발급한 회원 ID (추가 인증 신청 시 사용)
  userId?: string;
  /**
   * 데모(심사) 모드 — App Review 가이드라인 2.1(a) demonstration mode.
   * 데모 계정 로그인 시 true: 전 기능 열람 + 크레딧 구매는 서버 검증 없이
   * StoreKit 샌드박스로 완결(잔액은 로컬 가산). 일반 사용자 흐름에는 영향 없음.
   */
  demoMode: boolean;
  /** 이용약관·커뮤니티 가이드라인 동의 여부 (App Store 1.2 · 가입 진입 게이트). */
  acceptedTerms: boolean;
  /** 내가 차단한 회원 id 목록 — 큐레이션·매칭·채팅 노출에서 제외(서버와 best-effort 동기화). */
  blocked: string[];

  set: (patch: Partial<SignupState>) => void;
  acceptTerms: () => void;
  block: (id: string) => void;
  isBlocked: (id: string) => boolean;
  reset: () => void;
}

// 학력 등 인증은 가입 단계가 아니라 '가입 후 추가 인증'으로 받는다 (docs/verification-sop.md §1).

export const useSignup = create<SignupState>((set, get) => ({
  verified: false,
  gender: 'male',
  photos: [],
  photoCount: 0,
  hobbies: [],
  demoMode: false,
  acceptedTerms: false,
  blocked: [],
  set: (patch) => set(patch),
  acceptTerms: () => set({ acceptedTerms: true }),
  block: (id) => set((s) => (s.blocked.includes(id) ? s : { blocked: [...s.blocked, id] })),
  isBlocked: (id) => get().blocked.includes(id),
  reset: () =>
    set({
      verified: false,
      gender: 'male',
      photos: [],
      photoCount: 0,
      hobbies: [],
      name: undefined,
      birth: undefined,
      phone: undefined,
      height: undefined,
      residenceRegion: undefined,
      activityRegion: undefined,
      jobCategory: undefined,
      school: undefined,
      hobbyEtc: undefined,
      drinkingFrequency: undefined,
      drinkingAmount: undefined,
      smoking: undefined,
      bodyType: undefined,
      introSections: undefined,
      referralCode: undefined,
      idToken: undefined,
      userId: undefined,
      demoMode: false,
      acceptedTerms: false,
      blocked: [],
    }),
}));
