import { create } from 'zustand';

/** 가입 심사 진행 상태 (Zustand) — 5단계 */
export interface SignupState {
  // Step 01 본인인증
  verified: boolean;
  name?: string;
  birth?: string;
  gender: 'male' | 'female';
  phone?: string;
  // Step 02 직업
  jobCategory?: string;
  // Step 03 사진
  photoCount: number;
  // Step 05 추천인
  referralCode?: string;

  set: (patch: Partial<SignupState>) => void;
  reset: () => void;
}

// 학력은 가입 단계가 아니라 '가입 후 추가 인증'으로 받는다 (docs/verification-sop.md §1).

export const useSignup = create<SignupState>((set) => ({
  verified: false,
  gender: 'male',
  photoCount: 0,
  set: (patch) => set(patch),
  reset: () =>
    set({
      verified: false,
      gender: 'male',
      photoCount: 0,
      name: undefined,
      jobCategory: undefined,
    }),
}));
