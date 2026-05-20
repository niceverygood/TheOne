import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface WaitlistConfirmProps {
  seq: number;
  referralCode: string;
  confirmUrl: string;
}

const ink = '#0F1014';
const ivory = '#FAF7F2';
const champagne = '#B8956A';
const gray = '#8B8378';

export function WaitlistConfirmEmail({ seq, referralCode, confirmUrl }: WaitlistConfirmProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>{`THE ONE 사전등록이 접수되었습니다 · #${seq}번째 신청자`}</Preview>
      <Body style={{ backgroundColor: ivory, fontFamily: 'Pretendard, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', padding: '40px 32px' }}>
          <Section
            style={{ backgroundColor: ink, padding: '40px 28px', textAlign: 'center' as const }}
          >
            <Text
              style={{ color: gray, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}
            >
              Application Received
            </Text>
            <Heading style={{ color: ivory, fontSize: 26, margin: '12px 0 0' }}>THE ONE</Heading>
            <Text style={{ color: champagne, fontSize: 14, margin: '6px 0 0' }}>
              #{seq}번째 신청자
            </Text>
          </Section>

          <Section style={{ padding: '28px 4px' }}>
            <Text style={{ color: ink, fontSize: 15, lineHeight: 1.7 }}>
              사전등록이 정상적으로 접수되었습니다. 출시 소식과 가입 심사 안내를 가장 먼저
              보내드릴게요.
            </Text>
            <Text style={{ color: gray, fontSize: 13, margin: '20px 0 6px' }}>나의 초대코드</Text>
            <Text
              style={{
                color: ink,
                fontSize: 20,
                fontFamily: 'monospace',
                letterSpacing: 1,
                border: `1px solid ${champagne}`,
                padding: '14px',
                textAlign: 'center' as const,
              }}
            >
              {referralCode}
            </Text>
            <Text style={{ color: gray, fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>
              친구에게 초대코드를 공유하면 출시 시 함께 우선 혜택을 받습니다.
            </Text>
            <Text style={{ fontSize: 13, marginTop: 24 }}>
              <a href={confirmUrl} style={{ color: champagne }}>
                등록 확인하기 →
              </a>
            </Text>
          </Section>

          <Text style={{ color: gray, fontSize: 11, marginTop: 8 }}>
            주식회사 바틀 · 본 메일은 발신 전용입니다.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WaitlistConfirmEmail;
