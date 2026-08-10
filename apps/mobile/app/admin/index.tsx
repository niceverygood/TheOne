import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../../src/theme';
import { Hairline, Screen, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';
import { showAlert } from '../../src/brand-alert';
import {
  fetchAdminMembers,
  approveAdminMember,
  fetchAdminReports,
  moderateAdminReport,
  type AdminPendingMember,
  type AdminReportGroup,
} from '../../src/signup-api';

const CATEGORY_KR: Record<string, string> = {
  fraud: '사기·금전요구',
  harassment: '성희롱·외설',
  external_contact: '외부 연락 유도',
  inappropriate_photo: '부적절한 사진',
  abuse: '비속어·모욕',
  impersonation: '사칭·가짜 프로필',
  no_show: '노쇼·약속위반',
  other: '기타',
};

/** 앱 내 관리자 콘솔 — isAdmin 계정 전용. 가입 심사 승인 + 신고 처리(정지/강퇴/복구). */
export default function AdminConsole() {
  const router = useRouter();
  const isAdmin = useSignup((s) => s.isAdmin);
  const [tab, setTab] = useState<'members' | 'reports'>('members');
  const [members, setMembers] = useState<AdminPendingMember[]>([]);
  const [reports, setReports] = useState<AdminReportGroup[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [m, r] = await Promise.all([fetchAdminMembers(), fetchAdminReports()]);
    setMembers(m.members);
    setReports(r.queue);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    reload();
  }, [isAdmin, reload]);

  if (!isAdmin) {
    return (
      <Screen>
        <View style={{ padding: 24, paddingTop: 60 }}>
          <Txt size={14} color={C.gray}>
            관리자 권한이 있는 계정으로 로그인해 주세요.
          </Txt>
          <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Txt variant="mono" size={13} color={C.champagne}>
              ← 뒤로
            </Txt>
          </Pressable>
        </View>
      </Screen>
    );
  }

  async function onApprove(m: AdminPendingMember) {
    setBusyId(m.id);
    const r = await approveAdminMember(m.id);
    setBusyId(null);
    if (r.ok) {
      setMembers((list) => list.filter((x) => x.id !== m.id));
    } else {
      showAlert('승인에 실패했어요', '잠시 후 다시 시도해 주세요.');
    }
  }

  function confirmModerate(g: AdminReportGroup, action: 'suspend' | 'ban' | 'reinstate') {
    const label = action === 'ban' ? '영구 강퇴' : action === 'suspend' ? '일시 정지' : '복구';
    showAlert(
      `${label}하시겠어요?`,
      `${g.gender === 'male' ? '남' : '여'} · ${g.jobCategory} 회원`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: label,
          style: action === 'ban' ? 'destructive' : 'default',
          onPress: async () => {
            setBusyId(g.userId);
            const r = await moderateAdminReport(g.userId, action);
            setBusyId(null);
            if (r.ok) {
              setReports((list) => list.filter((x) => x.userId !== g.userId));
            } else {
              showAlert('처리에 실패했어요', '잠시 후 다시 시도해 주세요.');
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 22 }}>
          Admin Console
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 4 }}>
          관리자 콘솔
        </Txt>

        {/* 탭 */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
          <Pressable
            onPress={() => setTab('members')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: RADIUS,
              borderWidth: 1,
              borderColor: tab === 'members' ? C.champagne : C.hairLight,
              backgroundColor: tab === 'members' ? C.champagne : 'transparent',
              alignItems: 'center',
            }}
          >
            <Txt size={13} color={tab === 'members' ? '#fff' : C.ink2} weight="500">
              가입 심사 · {members.length}
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => setTab('reports')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: RADIUS,
              borderWidth: 1,
              borderColor: tab === 'reports' ? C.champagne : C.hairLight,
              backgroundColor: tab === 'reports' ? C.champagne : 'transparent',
              alignItems: 'center',
            }}
          >
            <Txt size={13} color={tab === 'reports' ? '#fff' : C.ink2} weight="500">
              신고 처리 · {reports.length}
            </Txt>
          </Pressable>
        </View>

        {loading ? (
          <Txt size={12.5} color={C.gray} style={{ marginTop: 32, textAlign: 'center' }}>
            불러오는 중…
          </Txt>
        ) : tab === 'members' ? (
          <View style={{ marginTop: 24 }}>
            {members.length === 0 ? (
              <Txt size={12.5} color={C.gray} style={{ textAlign: 'center', paddingVertical: 24 }}>
                대기 중인 심사가 없습니다.
              </Txt>
            ) : (
              members.map((m) => (
                <View key={m.id} style={{ paddingVertical: 14 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View>
                      <Txt size={14} weight="500" color={C.ink2}>
                        {m.gender === 'male' ? '남' : '여'} · {m.jobCategory}
                      </Txt>
                      <Txt size={11} color={C.gray} style={{ marginTop: 3 }}>
                        {m.createdAt.slice(0, 16).replace('T', ' ')}
                        {m.referredBySeq ? ` · 추천 #${m.referredBySeq}` : ''}
                      </Txt>
                    </View>
                    <Pressable
                      onPress={() => onApprove(m)}
                      disabled={busyId === m.id}
                      style={{
                        borderWidth: 1,
                        borderColor: C.sage,
                        backgroundColor: C.sage,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: RADIUS,
                        opacity: busyId === m.id ? 0.5 : 1,
                      }}
                    >
                      <Txt size={12.5} color="#fff" weight="500">
                        {busyId === m.id ? '처리 중…' : '승인'}
                      </Txt>
                    </Pressable>
                  </View>
                  <Hairline style={{ marginTop: 14 }} />
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={{ marginTop: 24 }}>
            {reports.length === 0 ? (
              <Txt size={12.5} color={C.gray} style={{ textAlign: 'center', paddingVertical: 24 }}>
                미처리 신고가 없습니다.
              </Txt>
            ) : (
              reports.map((g) => (
                <View key={g.userId} style={{ paddingVertical: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Txt size={14} weight="500" color={C.ink2}>
                      {g.gender === 'male' ? '남' : '여'} · {g.jobCategory}
                    </Txt>
                    <Txt variant="mono" size={10.5} color={C.terra}>
                      신고 {g.count}건
                    </Txt>
                  </View>
                  <Txt size={11.5} color={C.gray} style={{ marginTop: 4 }}>
                    {[...new Set(g.categories)].map((c) => CATEGORY_KR[c] ?? c).join(', ')}
                  </Txt>
                  <Txt size={10.5} color={C.graySoft} style={{ marginTop: 2 }}>
                    현재 상태: {g.status} · 정지 이력 {g.suspendCount}회
                  </Txt>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    {g.status !== 'suspended' && g.status !== 'withdrawn' ? (
                      <Pressable
                        onPress={() => confirmModerate(g, 'suspend')}
                        disabled={busyId === g.userId}
                        style={{
                          borderWidth: 1,
                          borderColor: C.champagne,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: RADIUS,
                        }}
                      >
                        <Txt size={11.5} color={C.champagne}>
                          일시정지
                        </Txt>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => confirmModerate(g, 'ban')}
                      disabled={busyId === g.userId}
                      style={{
                        borderWidth: 1,
                        borderColor: C.terra,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: RADIUS,
                      }}
                    >
                      <Txt size={11.5} color={C.terra}>
                        영구강퇴
                      </Txt>
                    </Pressable>
                    {g.status !== 'active' ? (
                      <Pressable
                        onPress={() => confirmModerate(g, 'reinstate')}
                        disabled={busyId === g.userId}
                        style={{
                          borderWidth: 1,
                          borderColor: C.hairLight,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: RADIUS,
                        }}
                      >
                        <Txt size={11.5} color={C.gray}>
                          복구
                        </Txt>
                      </Pressable>
                    ) : null}
                  </View>
                  <Hairline style={{ marginTop: 14 }} />
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}
