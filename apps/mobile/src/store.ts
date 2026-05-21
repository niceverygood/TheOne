import { create } from 'zustand';

/** 가입 심사 진행 상태 (Zustand) */
export interface SignupState {
  // Step 01
  verified: boolean;
  name?: string;
  birth?: string;
  gender: 'male' | 'female';
  phone?: string;
  // Step 02
  jobCategory?: string;
  // Step 03
  school?: string;
  major?: string;
  degree?: '학사' | '석사' | '박사';
  // Step 04
  photoCount: number;
  // Step 06
  referralCode?: string;

  set: (patch: Partial<SignupState>) => void;
  reset: () => void;
}

export const useSignup = create<SignupState>((set) => ({
  verified: false,
  gender: 'male',
  photoCount: 0,
  degree: '석사',
  set: (patch) => set(patch),
  reset: () =>
    set({
      verified: false,
      gender: 'male',
      photoCount: 0,
      degree: '석사',
      name: undefined,
      jobCategory: undefined,
    }),
}));
