/**
 * 4종 인증 화면 공통 제출 훅 — userId(가입 후) + 서류로 /api/verification 호출.
 * 성공 시 심사중 화면으로, 실패 시 Alert.
 * (DocUpload 가 데모라 실제 S3 키 대신 데모 키를 보낸다 — 운영 단계에서 업로드 키로 교체.)
 */
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import type { VerificationType } from '@theone/shared';
import { useSignup } from './store';
import { submitVerification } from './signup-api';

export function useVerifySubmit(opts: {
  type: VerificationType;
  label: string;
  valueTier?: string;
}) {
  const router = useRouter();
  const userId = useSignup((s) => s.userId);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    if (!userId) {
      Alert.alert('가입이 필요해요', '4종 인증은 가입 완료 후 신청할 수 있습니다.');
      return;
    }
    setSubmitting(true);
    const res = await submitVerification({
      userId,
      type: opts.type,
      valueTier: opts.valueTier,
      documents: [{ s3Key: `demo/${opts.type}/${userId}`, label: opts.label }],
    });
    setSubmitting(false);
    if (res.ok) {
      router.push('/verify/reviewing');
      return;
    }
    Alert.alert('신청에 실패했어요', res.message);
  };

  return { submitting, onSubmit };
}
