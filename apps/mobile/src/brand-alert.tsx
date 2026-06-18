/**
 * 브랜드 알림 — RN 기본 Alert.alert 대체(안드 시스템 팝업 톤 제거).
 * 명령형 API 는 Alert.alert 와 동일: showAlert(title, message?, buttons?).
 * 루트 레이아웃에 <BrandAlertHost /> 1개만 렌더하면 앱 전역에서 동작한다.
 */
import { create } from 'zustand';
import { Modal, Pressable, View } from 'react-native';
import { C, RADIUS } from './theme';
import { Txt } from './ui';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface AlertState {
  open: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
}

const useAlertStore = create<AlertState>(() => ({ open: false, title: '', buttons: [] }));

/** Alert.alert 호환 — 버튼 미지정 시 "확인" 단일 버튼. */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  useAlertStore.setState({
    open: true,
    title,
    message,
    buttons: buttons && buttons.length ? buttons : [{ text: '확인' }],
  });
}

function close() {
  useAlertStore.setState({ open: false });
}

function btnColor(style?: AlertButton['style']): string {
  if (style === 'destructive') return C.terra;
  if (style === 'cancel') return C.gray;
  return C.champagne;
}

export function BrandAlertHost() {
  const { open, title, message, buttons } = useAlertStore();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,16,20,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: C.ivory,
            borderWidth: 1,
            borderColor: C.hairLight,
            borderRadius: RADIUS,
            paddingTop: 22,
            paddingBottom: 14,
            paddingHorizontal: 22,
          }}
        >
          <Txt variant="serifKr" size={17} weight="700" color={C.ink2}>
            {title}
          </Txt>
          {message ? (
            <Txt size={13.5} color={C.gray} style={{ marginTop: 8, lineHeight: 20 }}>
              {message}
            </Txt>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: 20,
              marginTop: 22,
            }}
          >
            {buttons.map((b, i) => (
              <Pressable
                key={`${b.text}-${i}`}
                hitSlop={8}
                onPress={() => {
                  close();
                  b.onPress?.();
                }}
                style={{ paddingVertical: 6 }}
              >
                <Txt
                  size={14}
                  weight={b.style === 'cancel' ? '400' : '600'}
                  color={btnColor(b.style)}
                >
                  {b.text}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
