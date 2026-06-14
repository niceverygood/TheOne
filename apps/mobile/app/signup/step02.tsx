import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Dialog, PlusMark, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

const MAX_PHOTOS = 5;

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
  const [addOpen, setAddOpen] = useState(false); // 사진 추가 방식 선택 다이얼로그
  const [permOpen, setPermOpen] = useState(false); // 카메라 권한 안내 다이얼로그

  const remaining = MAX_PHOTOS - photos.length;

  // 앨범에서 선택 (안드로이드 시스템 포토피커 — 별도 권한 불필요)
  async function pickFromLibrary() {
    if (remaining <= 0) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
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
      setPermOpen(true);
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!res.canceled) {
      setPhotos((prev) => [...prev, res.assets[0]!.uri].slice(0, MAX_PHOTOS));
    }
  }

  // "+" 탭 → 앨범/카메라 선택 다이얼로그
  function onAdd() {
    if (remaining <= 0) return;
    setAddOpen(true);
  }

  function removeAt(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  // 그리드 슬롯: 항상 MAX_PHOTOS 칸을 노출(목업과 동일) — 채워진 칸은 사진, 나머지는 추가 칸
  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => i);

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
        {slots.map((i) =>
          i >= photos.length ? (
            <Pressable
              key={`add-${i}`}
              onPress={onAdd}
              style={{
                width: '31.5%',
                aspectRatio: 3 / 4,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: C.graySoft,
                borderRadius: RADIUS,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* 첫 빈 칸에만 + 마크 노출 — 나머지는 빈 슬롯 */}
              {i === photos.length ? <PlusMark size={18} color={C.graySoft} /> : null}
            </Pressable>
          ) : (
            <View key={`photo-${i}`} style={{ width: '31.5%', aspectRatio: 3 / 4 }}>
              <Image
                source={{ uri: photos[i] }}
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

      {/* 사진 추가 방식 — 브랜드 다이얼로그(OS Alert 대체) */}
      <Dialog
        visible={addOpen}
        title="사진 추가"
        message="어떻게 추가할까요?"
        onRequestClose={() => setAddOpen(false)}
        actions={[
          {
            label: '앨범에서 선택',
            onPress: () => {
              setAddOpen(false);
              void pickFromLibrary();
            },
          },
          {
            label: '카메라로 촬영',
            onPress: () => {
              setAddOpen(false);
              void takePhoto();
            },
          },
          { label: '취소', tone: 'cancel', onPress: () => setAddOpen(false) },
        ]}
      />

      {/* 카메라 권한 안내 — 브랜드 다이얼로그 */}
      <Dialog
        visible={permOpen}
        title="카메라 권한이 필요해요"
        message="설정에서 카메라 접근을 허용해 주세요."
        onRequestClose={() => setPermOpen(false)}
        actions={[{ label: '확인', onPress: () => setPermOpen(false) }]}
      />
    </AppShell>
  );
}
