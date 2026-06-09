import { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Txt } from '../../src/ui';
import { submitManualIdentity } from '../../src/signup-api';

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.graySoft}
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: C.hairLight,
          borderRadius: RADIUS,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: C.ink2,
          fontSize: 15,
        }}
      />
    </View>
  );
}

/** 본인 명의 아님 — 운영자 수동 본인인증 요청 */
export default function ManualIdentity() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [attached, setAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && attached;

  const onSubmit = async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    // 실제 신분증 업로드는 S3 업로드 후 키를 전달(현재 데모 키). 운영 단계에서 교체.
    const res = await submitManualIdentity({
      name: name.trim(),
      phone: phone.trim(),
      idCardS3Key: `demo/manual-id/${Date.now()}`,
    });
    setSubmitting(false);
    if (res.ok) {
      Alert.alert(
        '접수되었습니다',
        '운영자가 신분증을 확인한 뒤 입력하신 연락처로 안내드립니다. 보통 24시간 이내 처리됩니다.',
        [{ text: '확인', onPress: () => router.back() }],
      );
      return;
    }
    Alert.alert('접수에 실패했어요', res.message);
  };

  return (
    <AppShell
      eyebrow="Manual Verification"
      title="운영자 본인확인"
      subtitle="가족 명의 휴대폰 등으로 본인인증이 어려우신 경우, 신분증 사진을 남겨 주시면 운영자가 직접 확인해 드립니다."
      footer={
        <FormFooter
          onlyNext
          next={submitting ? '접수 중…' : '확인 요청 보내기'}
          disabled={!canSubmit || submitting}
          onNext={onSubmit}
          hint="입력하신 연락처로 결과를 안내드립니다."
        />
      }
    >
      <Input label="이름 (실명)" value={name} onChangeText={setName} placeholder="홍길동" />
      <Input
        label="연락 가능한 번호"
        value={phone}
        onChangeText={setPhone}
        placeholder="010-0000-0000"
        keyboardType="phone-pad"
      />

      <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
        신분증 사진
      </Txt>
      <Pressable
        onPress={() => setAttached((v) => !v)}
        style={{
          borderWidth: 1,
          borderStyle: attached ? 'solid' : 'dashed',
          borderColor: attached ? C.sage : C.graySoft,
          borderRadius: RADIUS,
          paddingVertical: 28,
          alignItems: 'center',
          backgroundColor: attached ? C.ivory2 : 'transparent',
        }}
      >
        <Txt variant="mono" size={11} color={attached ? C.sage : C.gray}>
          {attached ? '✓ 신분증 첨부됨 (데모)' : '+ 신분증 사진 첨부'}
        </Txt>
      </Pressable>

      <View
        style={{
          marginTop: 16,
          borderLeftWidth: 2,
          borderLeftColor: C.champagne,
          backgroundColor: C.ivory2,
          padding: 14,
        }}
      >
        <Txt size={11.5} color={C.ink2} style={{ lineHeight: 18 }}>
          개인정보 보호를 위해 <Txt weight="600">주민등록번호 뒤 7자리는 가린 사본</Txt>을 올려
          주세요. 신분증 사진은 암호화 저장되며, 본인확인 완료 후 30일 안에 자동 파기됩니다.
        </Txt>
      </View>
    </AppShell>
  );
}
