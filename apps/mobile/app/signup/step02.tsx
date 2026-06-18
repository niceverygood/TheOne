import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, View } from 'react-native';
import { showAlert } from '../../src/brand-alert';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  PHOTO_STUDIO_STYLES,
  PHOTO_STUDIO_DEFAULT_STYLE_IDS,
  PHOTO_STUDIO_MAX_SELECT,
} from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

const MAX_PHOTOS = 5;

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? (typeof window !== 'undefined' ? window.location.origin : '');

type AiResult = { style: string; label: string; uri: string; added: boolean };

const GUIDE = [
  '최근 6개월 이내 촬영한 본인 사진',
  '얼굴이 정면으로 또렷하게 보일 것',
  '단체 사진·과도한 보정·선글라스 불가',
  '검증 위원이 본인 여부를 확인합니다',
];

export default function Step02() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [photos, setPhotos] = useState<string[]>(useSignup.getState().photos ?? []);
  // 사진 추가 방식 선택 시트(앨범/카메라) — 안드 시스템 팝업 대신 브랜드 모달
  const [addOpen, setAddOpen] = useState(false);

  const remaining = MAX_PHOTOS - photos.length;

  // 앨범에서 선택
  // Android 는 legacy 피커(ACTION_GET_CONTENT)로 열어 즐겨찾기 등 전체 앨범·폴더를 탐색하게 한다.
  // (시스템 포토피커는 일부 기기에서 즐겨찾기/사용자 폴더가 안 보임)
  async function pickFromLibrary() {
    if (remaining <= 0) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
      legacy: Platform.OS === 'android',
    });
    if (!res.canceled) {
      setPhotos((prev) => [...prev, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    }
  }

  // 카메라로 촬영 (CAMERA 권한 필요 — 미허용 시 요청)
  async function takePhoto() {
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      showAlert('카메라 권한이 필요해요', '설정에서 카메라 접근을 허용해 주세요.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!res.canceled) {
      setPhotos((prev) => [...prev, res.assets[0]!.uri].slice(0, MAX_PHOTOS));
    }
  }

  // "+" 탭 → 브랜드 시트 오픈(앨범/카메라)
  function onAdd() {
    if (remaining <= 0) return;
    setAddOpen(true);
  }

  function removeAt(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  // AI 스튜디오 — 첫 사진(대표) 기반으로 선택한 장면을 생성. 동일 인물 유지가 원칙.
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResults, setAiResults] = useState<AiResult[]>([]);
  // 사용자가 고른 배경/장면 — 기본 2종(생성 시간 절약), 최대 5종까지.
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    ...PHOTO_STUDIO_DEFAULT_STYLE_IDS,
  ]);

  function toggleStyle(id: string) {
    setSelectedStyles((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= PHOTO_STUDIO_MAX_SELECT
          ? prev
          : [...prev, id],
    );
  }

  async function runAiStudio() {
    const source = photos[0];
    if (!source || aiBusy || selectedStyles.length === 0) return;
    setAiBusy(true);
    setAiResults([]);
    try {
      // 업로드 전 1280px JPEG 로 다운스케일 — 고화질 폰 사진(수 MB)이 그대로 올라가면
      // 서버 함수 페이로드 한도(~4.5MB)를 넘겨 실패하므로, 항상 줄여서 보낸다.
      // 결과는 1024x1536 로 생성되므로 입력이 1280px 보다 클 필요가 없다.
      let uploadUri = source;
      try {
        const resized = await manipulateAsync(source, [{ resize: { width: 1280 } }], {
          compress: 0.8,
          format: SaveFormat.JPEG,
        });
        uploadUri = resized.uri;
      } catch {
        // 리사이즈 실패 시 원본으로 시도(최악의 경우만)
      }
      const form = new FormData();
      if (Platform.OS === 'web') {
        const blob = await fetch(uploadUri).then((r) => r.blob());
        form.append('image', blob, 'photo.jpg');
      } else {
        // RN FormData 파일 파트 — 타입 정의에 없어 캐스팅
        form.append('image', {
          uri: uploadUri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as unknown as Blob);
      }
      form.append('styles', selectedStyles.join(',')); // 선택한 장면만 생성
      const res = await fetch(`${API_BASE}/api/ai/photo-studio`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const msg =
          data.reason === 'not_configured'
            ? 'AI 스튜디오가 아직 준비 중입니다. 잠시 후 다시 시도해 주세요.'
            : '생성에 실패했습니다. 다른 사진으로 다시 시도해 주세요.';
        showAlert('AI 스튜디오', msg);
        return;
      }
      const byId = new Map(PHOTO_STUDIO_STYLES.map((s) => [s.id as string, s.label]));
      setAiResults(
        (data.images as { style: string; b64: string; mime?: string }[]).map((img) => ({
          style: img.style,
          label: byId.get(img.style) ?? img.style,
          uri: `data:${img.mime ?? 'image/jpeg'};base64,${img.b64}`,
          added: false,
        })),
      );
    } catch {
      showAlert('AI 스튜디오', '네트워크 오류로 생성하지 못했습니다.');
    } finally {
      setAiBusy(false);
    }
  }

  function addAiResult(idx: number) {
    const r = aiResults[idx];
    if (!r || r.added) return;
    if (photos.length >= MAX_PHOTOS) {
      showAlert('사진이 가득 찼어요', `최대 ${MAX_PHOTOS}장까지 등록할 수 있습니다.`);
      return;
    }
    setPhotos((prev) => [...prev, r.uri].slice(0, MAX_PHOTOS));
    setAiResults((prev) => prev.map((x, i) => (i === idx ? { ...x, added: true } : x)));
  }

  // 그리드 슬롯: 선택한 사진들 + (여유 있으면) 추가 슬롯 1개
  const slots: ('add' | string)[] = [...photos];
  if (photos.length < MAX_PHOTOS) slots.push('add');

  return (
    <AppShell
      step={2}
      total={8}
      eyebrow="Photographs"
      title="사진"
      subtitle="얼굴이 선명히 보이는 사진을 최소 2장 등록해 주세요. 첫 사진이 대표 이미지가 됩니다."
      footer={
        <FormFooter
          next="다음 — 키"
          disabled={photos.length < 2}
          hint={photos.length < 2 ? '사진을 2장 이상 등록해 주세요.' : undefined}
          onNext={() => {
            set({ photos, photoCount: photos.length });
            router.push('/signup/step03');
          }}
        />
      }
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {slots.map((slot, i) =>
          slot === 'add' ? (
            // 비율 유지: aspectRatio 는 사진 슬롯과 동일하게 바깥 View 에 두고,
            // 점선 Pressable 은 100% 채움 — in-flow 자식(+)이 있을 때 Pressable 에 직접
            // aspectRatio 를 주면 일부 렌더러에서 세로가 무너져(가로>세로) 비율이 깨진다.
            <View key="add" style={{ width: '31.5%', aspectRatio: 3 / 4 }}>
              <Pressable
                onPress={onAdd}
                style={{
                  width: '100%',
                  height: '100%',
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: C.graySoft,
                  // Android 는 dashed + borderRadius 조합에서 하단/모서리가 잘려 보이는 렌더 버그가 있어
                  // 점선 박스만 각지게(radius 0) 둔다. (사진 카드는 radius 유지)
                  borderRadius: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt variant="mono" size={20} color={C.graySoft}>
                  +
                </Txt>
              </Pressable>
            </View>
          ) : (
            <View key={`${slot}-${i}`} style={{ width: '31.5%', aspectRatio: 3 / 4 }}>
              <Image
                source={{ uri: slot }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%', borderRadius: RADIUS }}
              />
              {i === 0 ? (
                <Txt
                  variant="mono"
                  size={8}
                  color={C.ivory}
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    left: 6,
                    backgroundColor: C.ink2,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}
                >
                  대표
                </Txt>
              ) : null}
              <Pressable
                onPress={() => removeAt(i)}
                hitSlop={8}
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: 'rgba(15,16,20,0.66)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt size={12} color={C.ivory}>
                  ✕
                </Txt>
              </Pressable>
            </View>
          ),
        )}
      </View>

      <Txt variant="mono" size={10} color={C.gray} style={{ marginTop: 12 }}>
        {photos.length} / {MAX_PHOTOS}
      </Txt>

      {/* AI 스튜디오 — 같은 사람, 스튜디오 품질. 이목구비는 바꾸지 않는다. */}
      {photos.length >= 1 ? (
        <View
          style={{
            marginTop: 20,
            borderWidth: 1,
            borderColor: C.hairLight,
            borderRadius: RADIUS,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt variant="serifEn" size={13} color={C.champagne}>
              AI Studio
            </Txt>
            {aiBusy ? <ActivityIndicator size="small" color={C.champagne} /> : null}
          </View>
          <Txt size={13.5} weight="500" color={C.ink2} style={{ marginTop: 6 }}>
            대표 사진으로 원하는 장면의 스튜디오 컷을 만들어 드립니다
          </Txt>
          <Txt size={11.5} color={C.gray} style={{ marginTop: 4, lineHeight: 17 }}>
            같은 사람, 더 좋은 조명과 구도 — 이목구비는 바꾸지 않습니다. 검증 위원이 원본과
            대조합니다.
          </Txt>

          {/* 장면 선택 — 어떤 배경/환경으로 만들지 (최대 5) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {PHOTO_STUDIO_STYLES.map((s) => {
              const on = selectedStyles.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => toggleStyle(s.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: on ? C.ink2 : C.hairLight,
                    backgroundColor: on ? C.ink2 : 'transparent',
                    borderRadius: RADIUS,
                  }}
                >
                  <Txt size={12} weight={on ? '600' : '400'} color={on ? C.ivory : C.ink2}>
                    {s.label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          <Txt size={11} color={C.gray} style={{ marginTop: 6 }}>
            {selectedStyles.length}/{PHOTO_STUDIO_MAX_SELECT} 장면 선택 · 탭하여 추가·해제
          </Txt>

          {aiResults.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {aiResults.map((r, idx) => (
                <Pressable
                  key={r.style}
                  onPress={() => addAiResult(idx)}
                  style={{ width: '48%', aspectRatio: 3 / 4 }}
                >
                  <Image
                    source={{ uri: r.uri }}
                    resizeMode="cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: RADIUS,
                      opacity: r.added ? 0.55 : 1,
                    }}
                  />
                  <Txt
                    variant="mono"
                    size={8}
                    color={C.ivory}
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      backgroundColor: r.added ? C.sage : C.ink2,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                    }}
                  >
                    {r.added ? '✓ 추가됨' : r.label}
                  </Txt>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            onPress={runAiStudio}
            disabled={aiBusy || selectedStyles.length === 0}
            style={{
              marginTop: 14,
              borderWidth: 1,
              borderColor: C.ink2,
              borderRadius: RADIUS,
              paddingVertical: 11,
              alignItems: 'center',
              opacity: aiBusy || selectedStyles.length === 0 ? 0.4 : 1,
            }}
          >
            <Txt size={13} weight="500" color={C.ink2}>
              {aiBusy
                ? '생성 중 — 1~3분 정도 걸립니다'
                : aiResults.length > 0
                  ? '다시 생성하기'
                  : `선택한 ${selectedStyles.length}개 장면 만들기`}
            </Txt>
          </Pressable>
          {aiResults.length > 0 ? (
            <Txt size={11} color={C.gray} style={{ marginTop: 8, textAlign: 'center' }}>
              마음에 드는 컷을 탭하면 사진 목록에 추가됩니다.
            </Txt>
          ) : null}
        </View>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
          가이드라인
        </Txt>
        {GUIDE.map((g) => (
          <View
            key={g}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
          >
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.champagne }} />
            <Txt size={12.5} color={C.ink2}>
              {g}
            </Txt>
          </View>
        ))}
      </View>

      {/* 사진 추가 방식 — 더원 톤 바텀시트 (안드 시스템 팝업 대체) */}
      <Modal
        visible={addOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAddOpen(false)}
      >
        <Pressable
          onPress={() => setAddOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(15,16,20,0.55)', justifyContent: 'flex-end' }}
        >
          {/* 시트 본문 — 탭이 오버레이로 전파되지 않게 별도 Pressable */}
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: C.ivory,
              borderTopLeftRadius: RADIUS,
              borderTopRightRadius: RADIUS,
              borderTopWidth: 1,
              borderColor: C.hairLight,
              paddingTop: 22,
              paddingBottom: 34,
              paddingHorizontal: 24,
            }}
          >
            <Txt variant="serifEn" size={13} color={C.champagne}>
              Add Photo
            </Txt>
            <Txt variant="serifKr" size={20} weight="700" color={C.ink2} style={{ marginTop: 3 }}>
              사진 추가
            </Txt>
            <Txt size={13} color={C.gray} style={{ marginTop: 4 }}>
              어떻게 추가할까요?
            </Txt>

            <View style={{ marginTop: 16 }}>
              <Pressable
                onPress={() => {
                  setAddOpen(false);
                  setTimeout(pickFromLibrary, Platform.OS === 'android' ? 250 : 0);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  borderTopWidth: 1,
                  borderColor: C.hairLight,
                }}
              >
                <Txt size={15} color={C.ink2}>
                  앨범에서 선택
                </Txt>
                <Txt variant="mono" size={14} color={C.graySoft}>
                  ›
                </Txt>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAddOpen(false);
                  setTimeout(takePhoto, Platform.OS === 'android' ? 250 : 0);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  borderTopWidth: 1,
                  borderColor: C.hairLight,
                }}
              >
                <Txt size={15} color={C.ink2}>
                  카메라로 촬영
                </Txt>
                <Txt variant="mono" size={14} color={C.graySoft}>
                  ›
                </Txt>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setAddOpen(false)}
              style={{
                marginTop: 14,
                paddingVertical: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: RADIUS,
              }}
            >
              <Txt size={14} color={C.gray}>
                취소
              </Txt>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </AppShell>
  );
}
