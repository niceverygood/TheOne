import { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from './theme';
import { Btn, Hairline, Screen, Txt } from './ui';

/* ============================================================
   인증/폼/채팅/안전 공통 프리미티브 (상용 화면용)
   ============================================================ */

/* ---- 인증 상태 뱃지 ---- */
export type VState = 'none' | 'pending' | 'verified' | 'rejected';
export function VBadge({ state, size = 'md' }: { state: VState; size?: 'sm' | 'md' }) {
  const map: Record<VState, { bg: string; bd: string; fg: string; txt: string }> = {
    none: { bg: 'transparent', bd: C.hairLight, fg: C.gray, txt: '미인증' },
    pending: { bg: 'transparent', bd: C.champagne, fg: C.champagne, txt: '심사중' },
    verified: { bg: C.sage, bd: C.sage, fg: C.ivory, txt: '승인됨' },
    rejected: { bg: 'transparent', bd: C.terra, fg: C.terra, txt: '반려' },
  };
  const c = map[state];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: c.bg,
        borderWidth: 1,
        borderColor: c.bd,
        paddingHorizontal: size === 'sm' ? 8 : 11,
        paddingVertical: size === 'sm' ? 3 : 5,
        borderRadius: RADIUS,
      }}
    >
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.fg }} />
      <Txt variant="mono" size={size === 'sm' ? 9.5 : 10.5} color={c.fg}>
        {c.txt}
      </Txt>
    </View>
  );
}

/* ---- 다중 파일 업로드 행 ---- */
export interface DocSpec {
  label: string;
  required: boolean;
}
export function DocUpload({
  doc,
  attached: initial = false,
}: {
  doc: DocSpec;
  attached?: boolean;
}) {
  const [files, setFiles] = useState<{ name: string; size: string }[]>(
    initial ? [{ name: `${doc.label}.pdf`, size: '1.2 MB' }] : [],
  );
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Txt size={13.5} weight="500" color={C.ink2}>
          {doc.label}
        </Txt>
        {doc.required ? (
          <Txt variant="mono" size={9} color={C.terra}>
            필수
          </Txt>
        ) : (
          <Txt variant="serifEn" size={10} color={C.gray}>
            optional
          </Txt>
        )}
      </View>
      {files.length === 0 ? (
        <Pressable
          onPress={() => setFiles([{ name: `${doc.label}.pdf`, size: '0.9 MB' }])}
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: C.graySoft,
            padding: 18,
            alignItems: 'center',
            borderRadius: RADIUS,
          }}
        >
          <Txt size={13} weight="500" color={C.ink2}>
            + 파일 첨부
          </Txt>
          <Txt variant="serifEn" size={10.5} color={C.gray} style={{ marginTop: 3 }}>
            Drag or tap
          </Txt>
        </Pressable>
      ) : (
        files.map((f, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: C.hairLight,
              padding: 11,
              borderRadius: RADIUS,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Txt
                variant="mono"
                size={8.5}
                color={C.ivory}
                style={{ backgroundColor: C.terra, paddingHorizontal: 5, paddingVertical: 3 }}
              >
                PDF
              </Txt>
              <View>
                <Txt size={12.5} color={C.ink2}>
                  {f.name}
                </Txt>
                <Txt variant="mono" size={9} color={C.gray}>
                  {f.size}
                </Txt>
              </View>
            </View>
            <Pressable onPress={() => setFiles([])}>
              <Txt variant="mono" size={13} color={C.gray}>
                ✕
              </Txt>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

/* ---- 가액 구간 선택 ---- */
export function ValueTier({ tiers, initial = 1 }: { tiers: string[]; initial?: number }) {
  const [sel, setSel] = useState(initial);
  return (
    <View style={{ marginBottom: 24 }}>
      <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
        가액 구간
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tiers.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setSel(i)}
            style={{
              width: '48%',
              paddingVertical: 13,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: i === sel ? C.ink2 : C.hairLight,
              backgroundColor: i === sel ? C.ink2 : 'transparent',
              borderRadius: RADIUS,
            }}
          >
            <Txt size={13} color={i === sel ? C.ivory : C.ink2}>
              {t}
            </Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ---- 보안 카피 ---- */
export function SecurityNote() {
  return (
    <View
      style={{
        backgroundColor: C.ivory2,
        padding: 14,
        borderLeftWidth: 2,
        borderLeftColor: C.champagne,
        marginTop: 8,
      }}
    >
      <Txt size={11.5} color={C.gray} style={{ lineHeight: 19 }}>
        업로드 즉시 256-bit 암호화되어 관리자 외 접근이 불가합니다. 검토 완료 후 30일 안에 자동
        파기되며, 매칭 상대에게는 뱃지만 노출됩니다.
      </Txt>
    </View>
  );
}

/* ---- 인증 신청 공통 셸 ---- */
export function VerifyShell({
  en,
  title,
  days,
  subtitle,
  cta,
  onSubmit,
  children,
}: {
  en: string;
  title: string;
  days: string;
  subtitle?: string;
  cta: string;
  onSubmit?: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 22,
            }}
          >
            <Pressable onPress={() => router.back()}>
              <Txt variant="mono" size={18} color={C.ink2}>
                ←
              </Txt>
            </Pressable>
            <Txt variant="mono" size={10} color={C.gray}>
              평균 {days}일
            </Txt>
          </View>
          <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 8 }}>
            {en}
          </Txt>
          <Txt variant="serifKr" size={26} weight="700" color={C.ink2}>
            {title}
          </Txt>
          {subtitle ? (
            <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}>{children}</View>
        <View>
          <Hairline />
          <View style={{ padding: 24 }}>
            <Btn
              label={cta}
              variant="solid"
              onPress={onSubmit ?? (() => router.push('/verify/reviewing'))}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

/* ---- 토글 (프라이버시) ---- */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        width: 40,
        height: 23,
        borderRadius: RADIUS,
        padding: 2,
        backgroundColor: value ? C.ink2 : C.ivory3,
        alignItems: value ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          width: 19,
          height: 19,
          borderRadius: 1,
          backgroundColor: value ? C.champagne : '#fff',
        }}
      />
    </Pressable>
  );
}

/* ---- 채팅 버블 ---- */
export function Bubble({
  me,
  time,
  children,
}: {
  me?: boolean;
  time: string;
  children: ReactNode;
}) {
  return (
    <View style={{ alignItems: me ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <View
        style={{
          maxWidth: '78%',
          padding: 11,
          borderRadius: RADIUS,
          backgroundColor: me ? C.ink2 : '#fff',
          borderWidth: me ? 0 : 1,
          borderColor: C.hairLight,
        }}
      >
        <Txt size={13.5} color={me ? C.ivory : C.ink2} style={{ lineHeight: 20 }}>
          {children}
        </Txt>
      </View>
      <Txt variant="mono" size={9} color={C.gray} style={{ marginTop: 4 }}>
        {time}
      </Txt>
    </View>
  );
}

/* ---- 외부 연락처 마스킹 (packages/shared/masking.ts 모바일 미러) ---- */
const MASK = '●●●●';
const ID = '(?:\\s*[:：@]?\\s*(?:id|아이디)?\\s*[:：@]?\\s*)[\\w._-]+';
const MASK_RULES: RegExp[] = [
  /01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/g,
  /\b\d{11}\b/g,
  /[\w.+-]+@[\w-]+\.[\w.]+/g,
  new RegExp(`(?:카카오톡|카톡|오픈\\s?채팅|오카|kakao|katalk)${ID}`, 'gi'),
  new RegExp(`(?:인스타그램|인스타|instagram|insta)${ID}`, 'gi'),
  new RegExp(`(?:텔레그램|telegram)${ID}|t\\.me\\/[\\w._-]+`, 'gi'),
  new RegExp(`(?:라인|line|위챗|wechat)${ID}`, 'gi'),
];
export function maskContact(input: string): { text: string; masked: boolean } {
  let out = input;
  let masked = false;
  for (const re of MASK_RULES) {
    if (re.test(out)) masked = true;
    re.lastIndex = 0;
    out = out.replace(re, MASK);
    re.lastIndex = 0;
  }
  return { text: out, masked };
}
