'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MALE_JOB_CATEGORIES,
  FEMALE_JOB_CATEGORIES,
  ANALYTICS_EVENTS,
  type Gender,
  type WaitlistSubmitResult,
} from '@theone/shared';
import { submitWaitlist } from '@/app/actions/waitlist';
import { capture, trackFbLead } from '@/lib/analytics';
import { trackServer } from '@/lib/track-client';
import { Turnstile } from '@/components/turnstile';

export function WaitlistForm() {
  const [pending, setPending] = useState(false);
  const [gender, setGender] = useState<Gender>('male');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ seq: number; referralCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [refFromLink, setRefFromLink] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    capture(ANALYTICS_EVENTS.formView);
    trackServer('waitlist_view'); // 퍼널: 폼 노출(서버 집계)
    // 공유 링크(?ref=CODE 또는 ?invite=CODE)로 들어오면 초대코드 자동 입력 — 추천 루프
    const r = new URLSearchParams(window.location.search).get('ref') ?? '';
    const invite = new URLSearchParams(window.location.search).get('invite') ?? '';
    const code = (r || invite).trim().toUpperCase();
    if (code) {
      setRefCode(code);
      setRefFromLink(true);
    }
  }, []);

  // 퍼널: 폼 첫 상호작용(입력/포커스) 1회만 — 가입 의도 신호
  function onFirstInteraction() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackServer('waitlist_start');
  }

  const categories = gender === 'male' ? MALE_JOB_CATEGORIES : FEMALE_JOB_CATEGORIES;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    const formData = new FormData(e.currentTarget);
    capture(ANALYTICS_EVENTS.submitAttempt, { gender });

    setPending(true);
    try {
      const res: WaitlistSubmitResult = await submitWaitlist(formData);
      if (res.ok) {
        capture(ANALYTICS_EVENTS.submitSuccess, { seq: res.seq });
        // Facebook Lead 전환 — 서버 CAPI와 동일 eventId로 dedup
        if (res.eventId) trackFbLead(res.eventId, { content_name: 'waitlist' });
        setSuccess({ seq: res.seq, referralCode: res.referralCode });
      } else {
        capture(ANALYTICS_EVENTS.submitFail, { reason: res.reason });
        if (res.fieldErrors) setErrors(res.fieldErrors);
        setFormError(res.message);
      }
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="border border-hair-light bg-ivory p-8 text-center">
        <p className="font-sans-en text-[10px] uppercase tracking-[0.18em] text-champagne">
          Application Received
        </p>
        <p className="font-serif-kr mt-4 text-2xl font-bold text-ink-2">
          당신은 <span className="text-champagne">#{success.seq}</span>번째 신청자입니다
        </p>
        <p className="font-sans-kr mt-3 text-[13px] text-gray">
          출시 소식과 가입 심사 안내를 가장 먼저 보내드릴게요.
        </p>
        <div className="mt-7">
          <p className="font-sans-kr text-[12px] text-gray">나의 초대코드</p>
          <button
            type="button"
            onClick={() => {
              const link = `${window.location.origin}/?ref=${encodeURIComponent(success.referralCode)}`;
              navigator.clipboard?.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="mt-2 w-full border border-champagne px-4 py-4 font-mono text-lg tracking-wider text-ink-2 transition-opacity hover:opacity-80"
          >
            {success.referralCode}
          </button>
          <p className="font-sans-kr mt-2 text-[11px] text-gray">
            {copied
              ? '초대 링크가 복사되었습니다'
              : '탭하면 초대 링크 복사 · 친구가 열면 코드 자동 적용'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onFocusCapture={onFirstInteraction}
      onChangeCapture={onFirstInteraction}
      className="border border-hair-light bg-ivory p-7"
      noValidate
    >
      {/* 허니팟 — 사람에게 숨김 */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          웹사이트
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* 이메일 */}
      <label className="block">
        <span className="font-sans-en text-[10px] uppercase tracking-[0.14em] text-gray">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          aria-invalid={!!errors.email}
          className="mt-2 w-full border-b border-hair-light bg-transparent pb-2 text-[15px] text-ink-2 outline-none placeholder:text-gray-soft focus:border-ink-2"
        />
        {errors.email && <span className="mt-1 block text-[11px] text-terra">{errors.email}</span>}
      </label>

      {/* 성별 */}
      <fieldset className="mt-6">
        <legend className="font-sans-en text-[10px] uppercase tracking-[0.14em] text-gray">
          Gender
        </legend>
        <div className="mt-2 flex gap-2">
          {(['male', 'female'] as const).map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGender(g)}
              aria-pressed={gender === g}
              className={`flex-1 border py-3 text-sm transition-colors ${
                gender === g
                  ? 'border-ink-2 bg-ink-2 text-ivory'
                  : 'border-hair-light text-ink-2 hover:border-gray-soft'
              }`}
            >
              {g === 'male' ? '남성' : '여성'}
            </button>
          ))}
        </div>
        <input type="hidden" name="gender" value={gender} />
      </fieldset>

      {/* 직업 카테고리 */}
      <label className="mt-6 block">
        <span className="font-sans-en text-[10px] uppercase tracking-[0.14em] text-gray">
          Occupation
        </span>
        <select
          name="jobCategory"
          required
          defaultValue=""
          aria-invalid={!!errors.jobCategory}
          className="mt-2 w-full border-b border-hair-light bg-transparent pb-2 text-[15px] text-ink-2 outline-none focus:border-ink-2"
        >
          <option value="" disabled>
            직업 카테고리 선택
          </option>
          {categories.map((c) => (
            <option key={`${gender}-${c.id}`} value={c.id}>
              {c.kr} · {c.detail}
            </option>
          ))}
        </select>
        {errors.jobCategory && (
          <span className="mt-1 block text-[11px] text-terra">{errors.jobCategory}</span>
        )}
      </label>

      {/* 초대코드 (선택) — 공유 링크(?ref=)로 들어오면 자동 입력 */}
      <label className="mt-6 block">
        <span className="font-sans-en text-[10px] uppercase tracking-[0.14em] text-gray">
          Invite code · 선택
        </span>
        <input
          type="text"
          name="referralCode"
          value={refCode}
          onChange={(e) => setRefCode(e.target.value.toUpperCase())}
          autoComplete="off"
          placeholder="THE-0000-00"
          className="mt-2 w-full border-b border-hair-light bg-transparent pb-2 font-mono text-[14px] uppercase text-ink-2 outline-none placeholder:text-gray-soft focus:border-ink-2"
        />
        {refFromLink && (
          <span className="mt-1 block text-[11px] text-sage">
            초대코드가 적용되었습니다 · 함께 우선 혜택
          </span>
        )}
      </label>

      {/* 약관 동의 */}
      <label className="mt-6 flex items-start gap-2">
        <input
          type="checkbox"
          name="agreeTerms"
          value="true"
          className="mt-1 accent-ink-2"
          required
        />
        <span className="font-sans-kr text-[12px] leading-relaxed text-gray">
          개인정보 수집·이용 및 출시 안내 수신에 동의합니다.{' '}
          <a href="/legal/privacy" className="underline">
            개인정보처리방침
          </a>
        </span>
      </label>
      {errors.agreeTerms && (
        <span className="mt-1 block text-[11px] text-terra">{errors.agreeTerms}</span>
      )}

      <div className="mt-5">
        <Turnstile />
      </div>

      {formError && (
        <p role="alert" className="mt-4 text-[12px] text-terra">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full bg-ink-2 py-4 text-sm text-ivory transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {pending ? '등록 중…' : '사전등록 신청'}
      </button>
    </form>
  );
}
