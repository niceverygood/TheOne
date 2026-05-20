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

export interface WaitlistReferralThanksProps {
  referralCode: string;
  invitedCount: number;
}

const ink = '#0F1014';
const ivory = '#FAF7F2';
const champagne = '#B8956A';
const gray = '#8B8378';

export function WaitlistReferralThanksEmail({
  referralCode,
  invitedCount,
}: WaitlistReferralThanksProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>{`초대해 주셔서 감사합니다 · 누적 ${invitedCount}명`}</Preview>
      <Body style={{ backgroundColor: ivory, fontFamily: 'Pretendard, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: '0 auto', padding: '40px 32px' }}>
          <Section
            style={{ backgroundColor: ink, padding: '36px 28px', textAlign: 'center' as const }}
          >
            <Text
              style={{ color: gray, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}
            >
              Thank You
            </Text>
            <Heading style={{ color: ivory, fontSize: 22, margin: '12px 0 0' }}>
              초대해 주셔서 감사합니다
            </Heading>
          </Section>
          <Section style={{ padding: '28px 4px' }}>
            <Text style={{ color: ink, fontSize: 15, lineHeight: 1.7 }}>
              회원님의 초대코드 <strong style={{ fontFamily: 'monospace' }}>{referralCode}</strong>
              로 지금까지 <strong>{invitedCount}명</strong>이 사전등록했어요. 출시 시 우선 혜택으로
              보답하겠습니다.
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

export default WaitlistReferralThanksEmail;
