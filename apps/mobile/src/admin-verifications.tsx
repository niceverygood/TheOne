/**
 * 앱 내 관리자 — 인증 심사(8종) 탭.
 * 웹 어드민 /verifications 와 동일한 큐(SLA 임박순)·승인/반려 로직을 앱에서 처리한다.
 *
 * 서류 원본은 앱에 내려받지 않는다 — 워터마크·다운로드 차단이 걸린 웹 보안 뷰어 전용
 * (verification-sop §5-1). 앱은 서류 메타(라벨·형식·용량)까지만 본다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { REJECT_REASONS, VERIFICATION_LABELS, slaRemaining } from '@theone/shared';
import { C, RADIUS } from './theme';
import { Hairline, Txt } from './ui';
import { showAlert } from './brand-alert';
import {
  fetchAdminVerificationDetail,
  reviewAdminVerification,
  type AdminVerificationDetail,
  type AdminVerificationItem,
  type AdminVerificationStats,
} from './signup-api';

const MAX_CUSTOM_REASON = 300;

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: alert ? C.terra : C.hairLight,
        borderRadius: RADIUS,
        paddingVertical: 10,
        alignItems: 'center',
      }}
    >
      <Txt variant="mono" size={9.5} color={C.gray}>
        {label}
      </Txt>
      <Txt variant="serifKr" size={20} weight="700" color={alert ? C.terra : C.ink2}>
        {value}
      </Txt>
    </View>
  );
}

export function AdminVerifications({
  stats,
  queue,
  onReviewed,
}: {
  stats: AdminVerificationStats;
  queue: AdminVerificationItem[];
  /** 승인/반려 완료 — 상위에서 큐를 다시 불러온다. */
  onReviewed: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminVerificationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reasonCode, setReasonCode] = useState<string>(REJECT_REASONS[0]!.code);
  const [reasonText, setReasonText] = useState('');
  /** 상세 조회 순번 — 빠르게 다른 행을 열었을 때 늦게 도착한 응답을 버린다. */
  const detailReq = useRef(0);

  const closeRow = useCallback(() => {
    detailReq.current += 1;
    setOpenId(null);
    setDetail(null);
    setRejecting(false);
    setReasonText('');
    setReasonCode(REJECT_REASONS[0]!.code);
  }, []);

  // 열린 행이 큐에서 사라지면(다른 운영자가 처리 등) 패널도 닫는다.
  useEffect(() => {
    if (openId && !queue.some((q) => q.id === openId)) closeRow();
  }, [queue, openId, closeRow]);

  async function toggle(item: AdminVerificationItem) {
    if (openId === item.id) {
      closeRow();
      return;
    }
    const req = (detailReq.current += 1);
    setOpenId(item.id);
    setDetail(null);
    setRejecting(false);
    setReasonText('');
    setReasonCode(REJECT_REASONS[0]!.code);
    setDetailLoading(true);
    const d = await fetchAdminVerificationDetail(item.id);
    if (detailReq.current !== req) return; // 그 사이 다른 행을 열었거나 닫았다
    setDetailLoading(false);
    setDetail(d);
    if (!d) showAlert('상세를 불러오지 못했어요', '잠시 후 다시 시도해 주세요.');
  }

  async function submit(action: 'approve' | 'reject') {
    if (!openId || busy) return;
    setBusy(true);
    const r = await reviewAdminVerification({
      applicationId: openId,
      action,
      ...(action === 'reject' ? { reasonCode, reasonText } : {}),
    });
    setBusy(false);

    if (r.ok) {
      closeRow();
      onReviewed();
      if (action === 'approve') {
        showAlert(
          '승인했어요',
          r.rewardCredits ? `뱃지 부여 · 회원에게 ${r.rewardCredits}C 지급` : '뱃지를 부여했어요.',
        );
      }
      return;
    }
    showAlert(
      '처리하지 못했어요',
      r.reason === 'already_reviewed'
        ? '이미 처리된 신청입니다. 목록을 새로고침해 주세요.'
        : r.reason === 'reason_required'
          ? '기타 사유는 내용을 입력해 주세요.'
          : '잠시 후 다시 시도해 주세요.',
    );
  }

  function confirmApprove() {
    const reward = detail?.rewardCredits ?? 0;
    showAlert(
      '승인하시겠어요?',
      `인증 뱃지가 1년간 부여됩니다.${reward ? ` 회원에게 ${reward}C가 지급돼요.` : ''}`,
      [
        { text: '취소', style: 'cancel' },
        { text: '승인', onPress: () => void submit('approve') },
      ],
    );
  }

  const selectedReason = REJECT_REASONS.find((r) => r.code === reasonCode)!;
  const rejectDisabled = busy || (reasonCode === 'other' && !reasonText.trim());

  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Stat label="대기" value={stats.pending} />
        <Stat label="SLA 임박" value={stats.urgent} alert={stats.urgent > 0} />
        <Stat label="오늘 승인" value={stats.approvedToday} />
        <Stat label="오늘 반려" value={stats.rejectedToday} />
      </View>

      {queue.length === 0 ? (
        <Txt size={12.5} color={C.gray} style={{ textAlign: 'center', paddingVertical: 32 }}>
          대기 중인 인증 심사가 없습니다.
        </Txt>
      ) : (
        <View style={{ marginTop: 20 }}>
          {queue.map((item) => {
            const sla = slaRemaining(item.slaDueAt);
            const open = openId === item.id;
            return (
              <View key={item.id} style={{ paddingVertical: 14 }}>
                <Pressable onPress={() => void toggle(item)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Txt size={14} weight="500" color={C.ink2}>
                          {VERIFICATION_LABELS[item.type].kr}
                        </Txt>
                        {item.valueTier ? (
                          <Txt variant="mono" size={10} color={C.champagne}>
                            {item.valueTier}
                          </Txt>
                        ) : null}
                      </View>
                      <Txt size={11.5} color={C.gray} style={{ marginTop: 3 }}>
                        {item.gender === 'male' ? '남' : '여'} · {item.jobCategory} · 서류{' '}
                        {item.docLabels.length}건
                      </Txt>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Txt variant="mono" size={10.5} color={sla.urgent ? C.terra : C.gray}>
                        {sla.text}
                      </Txt>
                      <Txt size={11} color={C.champagne} style={{ marginTop: 4 }}>
                        {open ? '닫기' : '심사'}
                      </Txt>
                    </View>
                  </View>
                </Pressable>

                {open ? (
                  <View
                    style={{
                      marginTop: 14,
                      borderWidth: 1,
                      borderColor: C.hairLight,
                      borderRadius: RADIUS,
                      padding: 14,
                      backgroundColor: C.ivory2,
                    }}
                  >
                    {detailLoading ? (
                      <Txt size={12} color={C.gray}>
                        불러오는 중…
                      </Txt>
                    ) : !detail ? (
                      <Txt size={12} color={C.terra}>
                        상세를 불러오지 못했습니다.
                      </Txt>
                    ) : (
                      <>
                        <Txt variant="mono" size={9.5} color={C.gray}>
                          제출 {detail.submittedAt.slice(0, 16).replace('T', ' ')} · 마감{' '}
                          {detail.slaDueAt.slice(0, 16).replace('T', ' ')}
                        </Txt>

                        <Txt size={11} color={C.gray} style={{ marginTop: 12 }}>
                          필수 서류
                        </Txt>
                        {detail.requiredDocs.map((label) => {
                          const submitted = detail.documents.some((d) => d.label === label);
                          return (
                            <Txt
                              key={label}
                              size={12}
                              color={submitted ? C.ink2 : C.terra}
                              style={{ marginTop: 4 }}
                            >
                              {submitted ? '✓' : '×'} {label}
                            </Txt>
                          );
                        })}

                        <Txt size={11} color={C.gray} style={{ marginTop: 14 }}>
                          제출 서류 {detail.documents.length}건
                        </Txt>
                        {detail.documents.map((d) => (
                          <Txt key={d.id} size={11.5} color={C.ink2} style={{ marginTop: 4 }}>
                            {d.label} · {(d.size / 1024).toFixed(0)}KB · {d.mime}
                          </Txt>
                        ))}
                        <Txt size={10.5} color={C.graySoft} style={{ marginTop: 8 }}>
                          서류 원본은 보안 뷰어(웹 콘솔)에서만 열람할 수 있어요.
                        </Txt>

                        {detail.rejectReason ? (
                          <Txt size={11.5} color={C.terra} style={{ marginTop: 12 }}>
                            이전 반려: {detail.rejectReason}
                          </Txt>
                        ) : null}

                        <Hairline style={{ marginTop: 16 }} />

                        {!rejecting ? (
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                            <Pressable
                              onPress={confirmApprove}
                              disabled={busy}
                              style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: C.sage,
                                backgroundColor: C.sage,
                                borderRadius: RADIUS,
                                paddingVertical: 10,
                                alignItems: 'center',
                                opacity: busy ? 0.5 : 1,
                              }}
                            >
                              <Txt size={12.5} color="#fff" weight="500">
                                {busy
                                  ? '처리 중…'
                                  : `승인${detail.rewardCredits ? ` · +${detail.rewardCredits}C` : ''}`}
                              </Txt>
                            </Pressable>
                            <Pressable
                              onPress={() => setRejecting(true)}
                              disabled={busy}
                              style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: C.terra,
                                borderRadius: RADIUS,
                                paddingVertical: 10,
                                alignItems: 'center',
                              }}
                            >
                              <Txt size={12.5} color={C.terra} weight="500">
                                반려
                              </Txt>
                            </Pressable>
                          </View>
                        ) : (
                          <View style={{ marginTop: 14 }}>
                            <Txt size={11} color={C.gray}>
                              반려 사유
                            </Txt>
                            <View
                              style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 6,
                                marginTop: 8,
                              }}
                            >
                              {REJECT_REASONS.map((r) => {
                                const on = r.code === reasonCode;
                                return (
                                  <Pressable
                                    key={r.code}
                                    onPress={() => setReasonCode(r.code)}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: on ? C.champagne : C.hairLight,
                                      backgroundColor: on ? C.champagneSoft : 'transparent',
                                      borderRadius: RADIUS,
                                      paddingHorizontal: 10,
                                      paddingVertical: 6,
                                    }}
                                  >
                                    <Txt size={11.5} color={on ? C.champagne : C.gray}>
                                      {r.label}
                                    </Txt>
                                  </Pressable>
                                );
                              })}
                            </View>

                            {reasonCode === 'other' ? (
                              <TextInput
                                value={reasonText}
                                onChangeText={(v) => setReasonText(v.slice(0, MAX_CUSTOM_REASON))}
                                placeholder="상세 사유 입력 (회원에게 그대로 전달됩니다)"
                                placeholderTextColor={C.graySoft}
                                multiline
                                maxLength={MAX_CUSTOM_REASON}
                                style={{
                                  borderWidth: 1,
                                  borderColor: C.hairLight,
                                  borderRadius: RADIUS,
                                  backgroundColor: '#fff',
                                  padding: 12,
                                  minHeight: 76,
                                  marginTop: 10,
                                  fontSize: 12.5,
                                  lineHeight: 20,
                                  color: C.ink2,
                                  textAlignVertical: 'top',
                                }}
                              />
                            ) : (
                              <Txt
                                size={12}
                                color={C.ink2}
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#fff',
                                  padding: 12,
                                  lineHeight: 19,
                                }}
                              >
                                {selectedReason.message}
                              </Txt>
                            )}

                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                              <Pressable
                                onPress={() => void submit('reject')}
                                disabled={rejectDisabled}
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: C.terra,
                                  backgroundColor: C.terra,
                                  borderRadius: RADIUS,
                                  paddingVertical: 10,
                                  alignItems: 'center',
                                  opacity: rejectDisabled ? 0.5 : 1,
                                }}
                              >
                                <Txt size={12.5} color="#fff" weight="500">
                                  {busy ? '처리 중…' : '반려 확정'}
                                </Txt>
                              </Pressable>
                              <Pressable
                                onPress={() => setRejecting(false)}
                                disabled={busy}
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: C.hairLight,
                                  borderRadius: RADIUS,
                                  paddingVertical: 10,
                                  alignItems: 'center',
                                }}
                              >
                                <Txt size={12.5} color={C.gray}>
                                  취소
                                </Txt>
                              </Pressable>
                            </View>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                ) : null}

                <Hairline style={{ marginTop: 14 }} />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
