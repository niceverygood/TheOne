/* ============================================================
   THE ONE · 더원 — 캔버스 조립
   모든 화면을 PhoneFrame에 담아 DesignCanvas 섹션별로 정렬
   ============================================================ */

function Frame({ id, label, dark, statusDark, note, children }) {
  return (
    <DCArtboard id={id} label={label}>
      <PhoneFrame dark={dark} statusDark={statusDark}>{children}</PhoneFrame>
      {note && <div style={{ marginTop: 18 }}><DCPostIt>{note}</DCPostIt></div>}
    </DCArtboard>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="A · 진입" title="Entry" subtitle="잉크 캔버스 · Application Only · 가입 통과율 23%">
        <Frame id="01" label="Splash · Application Gate" dark statusDark="var(--ivory)"
          note="골드/그라데이션 금지. 잉크 블랙 위 샴페인 코너 틱과 통과율 23%로 희소성을 전달.">
          <ScreenSplash />
        </Frame>
      </DCSection>

      <DCSection id="C · 매칭" title="Matching" subtitle="골드스푼 방식 · 무한 스와이프 절대 금지 · 신청서 → 매칭함 → 수락 시 채팅">
        <Frame id="03" label="오늘의 큐레이션 (Dossier)" dark statusDark="var(--ink-2)"
          note="톤을 결정하는 화면. 하루 1명 풀블리드 + 23:47 카운트다운. Pass / 더 알아보기 / Super Like 3버튼.">
          <ScreenCuration />
        </Frame>
        <Frame id="04" label="프로필 상세">
          <ScreenProfile />
        </Frame>
        <Frame id="12" label="만남 신청서 (Interest Letter)"
          note="틴더식 좋아요 대신 진지한 글쓰기. 일반 20C / 슈퍼 50C 차감.">
          <ScreenLetter />
        </Frame>
        <Frame id="13" label="매칭함 (Inbox)"
          note="정성이 담긴 글이 상단에 먼저. 정중히 거절 / 수락하고 채팅.">
          <ScreenInbox />
        </Frame>
        <Frame id="15" label="채팅 · 매칭 7일째">
          <ScreenChat />
        </Frame>
      </DCSection>

      <DCSection id="D · 경제" title="Economy" subtitle="크레딧 충전제 · 케미 분석 리포트">
        <Frame id="16" label="크레딧 충전">
          <ScreenCredits />
        </Frame>
        <Frame id="17" label="케미 분석 리포트"
          note="매칭 7일째 자동 발행. '상위 8%' 헤드라인 + 결혼관·라이프·갈등 3섹션.">
          <ScreenChemistry />
        </Frame>
      </DCSection>

      <DCSection id="B · 가입 심사" title="Application Review" subtitle="평균 5일 · 6단계 · 4중 검증">
        <Frame id="02" label="Intro · 6단계 미리보기"><ScreenSignupIntro /></Frame>
        <Frame id="Step 01" label="본인 인증"><ScreenStep01 /></Frame>
        <Frame id="Step 02·M" label="직업 (남성 · 11 카테고리)"
          note="성별 토글 + 2열 카드. 선택 시 잉크 솔리드 + 검증 기준 메타 + 카테고리별 다중 서류.">
          <ScreenStep02Male />
        </Frame>
        <Frame id="Step 02·F" label="직업 (여성 · 13 카테고리)"><ScreenStep02Female /></Frame>
        <Frame id="Step 03" label="학력"><ScreenStep03 /></Frame>
        <Frame id="Step 04" label="사진 · 5 슬롯"><ScreenStep04 /></Frame>
        <Frame id="Step 05" label="60문항 설문 · Likert"><ScreenStep05 /></Frame>
        <Frame id="Step 06" label="추천인 코드"><ScreenStep06 /></Frame>
        <Frame id="10" label="신청 완료 · 인장 + 타임라인" dark statusDark="var(--ivory)">
          <ScreenComplete />
        </Frame>
      </DCSection>

      <DCSection id="F · 추가 인증" title="Verifications" subtitle="가입 후 본인 신청 → 관리자 직접 검토 → 뱃지 부여">
        <Frame id="19" label="추가 인증 허브"
          note="4개 항목 뱃지 상태: none / pending / verified / rejected.">
          <ScreenVerifyHub />
        </Frame>
        <Frame id="20" label="학력 인증 신청"><ScreenVerifyEducation /></Frame>
        <Frame id="21" label="재산 인증 · 가액 4구간"><ScreenVerifyWealth /></Frame>
        <Frame id="22" label="차량 인증 · 등록증 + 사진"><ScreenVerifyVehicle /></Frame>
        <Frame id="23" label="부동산 인증 · 가액 4구간"><ScreenVerifyRealEstate /></Frame>
        <Frame id="24" label="인증 심사중 · 펄스">
          <ScreenVerifyReviewing />
        </Frame>
      </DCSection>

      <DCSection id="E · 안전 / 졸업" title="Privacy & Graduation" subtitle="5개 토글 + 졸업하기 모달">
        <Frame id="18" label="프라이버시 + 졸업"><ScreenPrivacy /></Frame>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
