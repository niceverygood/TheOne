import { useState } from 'react';
import { Alert, Linking, Modal, Pressable, TextInput, View } from 'react-native';
import { C, RADIUS } from './theme';
import { Btn, Hairline, Txt } from './ui';
import { useSignup } from './store';

/** 웹 법무 페이지 베이스 — 프로덕션 env(없으면 배포 URL 폴백). */
const WEB_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_BASE ??
  'https://the-one-web-virid.vercel.app';

/** 신고 8종 (trust-safety.md §3-2 · Prisma ReportCategory 와 동일 키). */
export const REPORT_CATEGORIES = [
  { value: 'fraud', label: '사기·금전 요구' },
  { value: 'harassment', label: '성희롱·외설' },
  { value: 'external_contact', label: '외부 연락 유도' },
  { value: 'inappropriate_photo', label: '부적절한 사진' },
  { value: 'abuse', label: '비속어·모욕' },
  { value: 'impersonation', label: '사칭·가짜 프로필' },
  { value: 'no_show', label: '노쇼·약속 위반' },
  { value: 'other', label: '기타' },
] as const;
export type ReportCategoryValue = (typeof REPORT_CATEGORIES)[number]['value'];

export type LegalDoc = 'terms' | 'privacy' | 'child-safety';
const LEGAL_LABEL: Record<LegalDoc, string> = {
  terms: '이용약관',
  privacy: '개인정보처리방침',
  'child-safety': '커뮤니티 가이드라인',
};

/** 법무 문서를 외부 브라우저(웹)로 연다. */
export function openLegal(doc: LegalDoc) {
  Linking.openURL(`${WEB_BASE}/legal/${doc}`).catch(() =>
    Alert.alert(
      LEGAL_LABEL[doc],
      '문서를 여는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    ),
  );
}

/** 신고 접수 — 실제 회원 id가 있으면 서버에 기록, 없으면(데모) 로컬 접수로 간주. */
async function submitReport(args: {
  reporterId?: string;
  reportedId: string;
  category: ReportCategoryValue;
  detail?: string;
}): Promise<{ ok: boolean; reportId?: string }> {
  if (!WEB_BASE || !args.reporterId) return { ok: true };
  try {
    const res = await fetch(`${WEB_BASE}/api/safety/report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, reportId: json?.reportId };
  } catch {
    return { ok: false };
  }
}

/** 차단 기록 — 서버 best-effort(데모/오프라인은 로컬 차단만으로 충분). */
async function submitBlock(args: { blockerId?: string; blockedId: string }): Promise<void> {
  if (!WEB_BASE || !args.blockerId) return;
  try {
    await fetch(`${WEB_BASE}/api/safety/block`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
  } catch {
    /* 로컬 차단은 이미 적용됨 — 네트워크 실패는 무시 */
  }
}

/**
 * 신고/차단 시트 (App Store 1.2 UGC 안전장치).
 * 채팅·프로필 헤더의 ⋯ 에서 호출. 신고는 사유 8종 + 상세, 차단은 즉시 적용 후 노출 제외.
 */
export function SafetySheet({
  visible,
  reportedName,
  reportedId,
  onClose,
  onBlocked,
}: {
  visible: boolean;
  reportedName: string;
  reportedId: string;
  onClose: () => void;
  onBlocked?: () => void;
}) {
  const userId = useSignup((s) => s.userId);
  const block = useSignup((s) => s.block);
  const [mode, setMode] = useState<'menu' | 'report'>('menu');
  const [cat, setCat] = useState<ReportCategoryValue | null>(null);
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);

  function close() {
    setMode('menu');
    setCat(null);
    setDetail('');
    setBusy(false);
    onClose();
  }

  async function doReport() {
    if (!cat || busy) return;
    setBusy(true);
    await submitReport({
      reporterId: userId,
      reportedId,
      category: cat,
      detail: detail.trim() || undefined,
    });
    setBusy(false);
    close();
    Alert.alert(
      '신고가 접수되었습니다',
      '운영진이 24시간 내 검토하며, 결과는 알림으로 알려드립니다. 누적 신고 시 상대 계정은 자동 정지됩니다.',
    );
  }

  function confirmBlock() {
    Alert.alert(
      `${reportedName} 님을 차단할까요?`,
      '차단하면 서로의 큐레이션·매칭·대화에서 더 이상 노출되지 않습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            block(reportedId);
            await submitBlock({ blockerId: userId, blockedId: reportedId });
            close();
            onBlocked?.();
            Alert.alert('차단 완료', `${reportedName} 님이 차단되었습니다.`);
          },
        },
      ],
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(15,16,20,0.45)' }} onPress={close} />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: C.ivory,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 36,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.hairLight }} />
        </View>

        {mode === 'menu' ? (
          <View>
            <Txt variant="serifKr" size={19} weight="700" color={C.ink2}>
              안전 도구
            </Txt>
            <Txt size={12.5} color={C.gray} style={{ marginTop: 6 }}>
              문제가 있었나요? 운영진이 24시간 내 확인합니다.
            </Txt>
            <Pressable onPress={() => setMode('report')} style={{ paddingVertical: 18 }}>
              <Txt size={15} weight="500" color={C.terra}>
                신고하기
              </Txt>
              <Txt size={11.5} color={C.gray} style={{ marginTop: 2 }}>
                사유를 선택해 운영진에게 알립니다
              </Txt>
            </Pressable>
            <Hairline />
            <Pressable onPress={confirmBlock} style={{ paddingVertical: 18 }}>
              <Txt size={15} weight="500" color={C.terra}>
                차단하기
              </Txt>
              <Txt size={11.5} color={C.gray} style={{ marginTop: 2 }}>
                서로의 노출·대화를 즉시 중단합니다
              </Txt>
            </Pressable>
            <Hairline />
            <Btn label="닫기" variant="ghost" style={{ marginTop: 16 }} onPress={close} />
          </View>
        ) : (
          <View>
            <Txt variant="serifKr" size={19} weight="700" color={C.ink2}>
              신고 사유
            </Txt>
            <Txt size={12.5} color={C.gray} style={{ marginTop: 6, marginBottom: 14 }}>
              {reportedName} 님을 신고합니다. 사유를 선택해 주세요.
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {REPORT_CATEGORIES.map((c) => {
                const on = cat === c.value;
                return (
                  <Pressable
                    key={c.value}
                    onPress={() => setCat(c.value)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: on ? C.ink2 : C.hairLight,
                      backgroundColor: on ? C.ink2 : 'transparent',
                      borderRadius: RADIUS,
                    }}
                  >
                    <Txt size={12.5} weight={on ? '600' : '400'} color={on ? C.ivory : C.ink2}>
                      {c.label}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={detail}
              onChangeText={setDetail}
              placeholder="상황을 자세히 적어주시면 검토에 도움이 됩니다 (선택)"
              placeholderTextColor={C.graySoft}
              multiline
              style={{
                marginTop: 14,
                minHeight: 64,
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: RADIUS,
                padding: 12,
                fontSize: 13,
                color: C.ink2,
                textAlignVertical: 'top',
                backgroundColor: '#fff',
              }}
            />
            <Btn
              label={busy ? '접수 중…' : '신고 접수'}
              variant="solid"
              disabled={!cat || busy}
              style={{ marginTop: 16 }}
              onPress={doReport}
            />
            <Btn
              label="뒤로"
              variant="ghost"
              style={{ marginTop: 8 }}
              onPress={() => setMode('menu')}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}
