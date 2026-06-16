'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MALE_JOB_CATEGORIES,
  FEMALE_JOB_CATEGORIES,
  PHOTO_STUDIO_DEFAULT_STYLE_IDS,
  PHOTO_STUDIO_MAX_BYTES,
  type Gender,
  type WaitlistSubmitResult,
} from '@theone/shared';
import { submitWaitlist } from '@/app/actions/waitlist';
import { capture, trackFbLead } from '@/lib/analytics';
import { Turnstile } from '@/components/turnstile';

type Phase = 'form' | 'submitting' | 'generating' | 'done';
type Result = { style: string; label: string; uri: string };

/** 업로드 전 브라우저에서 1280px JPEG 로 다운스케일 — 함수 페이로드 한도(~4.5MB) 회피. */
async function downscale(file: File, max = 1280): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', 0.8),
    );
    return blob ?? file;
  } catch {
    return file; // createImageBitmap 미지원 등 — 원본으로 시도
  }
}

const STYLE_LABELS: Record<string, string> = {
  studio: '클래식 스튜디오',
  natural: '내추럴 데일리',
  business: '비즈니스 포트레이트',
  film: '필름 무드',
};

export function AiPreview() {
  const [phase, setPhase] = useState<Phase>('form');
  const [gender, setGender] = useState<Gender>('male');
  const [photo, setPhoto] = useState<{ blob: Blob; previewUrl: string } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [seq, setSeq] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [genFailed, setGenFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    capture('ai_preview_view');
  }, []);

  // 미리보기 objectURL 정리
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photo]);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    if (!/^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(file.type) && file.type !== '') {
      setPhotoError('JPG · PNG · WEBP 이미지를 올려주세요.');
      return;
    }
    const blob = await downscale(file);
    if (blob.size > PHOTO_STUDIO_MAX_BYTES) {
      setPhotoError('이미지가 너무 큽니다. 다른 사진으로 시도해 주세요.');
      return;
    }
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setPhoto({ blob, previewUrl: URL.createObjectURL(blob) });
  }

  async function generate() {
    if (!photo) return;
    setGenFailed(false);
    setPhase('generating');
    try {
      const form = new FormData();
      form.append('image', photo.blob, 'photo.jpg');
      form.append('styles', PHOTO_STUDIO_DEFAULT_STYLE_IDS.join(','));
      const res = await fetch('/api/ai/photo-studio', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setGenFailed(true);
        setPhase('done');
        return;
      }
      setResults(
        (data.images as { style: string; b64: string; mime?: string }[]).map((img) => ({
          style: img.style,
          label: STYLE_LABELS[img.style] ?? img.style,
          uri: `data:${img.mime ?? 'image/jpeg'};base64,${img.b64}`,
        })),
      );
      capture('ai_preview_generated', { count: data.images?.length ?? 0 });
      setPhase('done');
    } catch {
      setGenFailed(true);
      setPhase('done');
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    if (!photo) {
      setPhotoError('사진을 먼저 올려주세요.');
      return;
    }
    capture('ai_preview_submit', { gender });
    setPhase('submitting');

    const fd = new FormData(e.currentTarget);
    let res: WaitlistSubmitResult;
    try {
      res = await submitWaitlist(fd);
    } catch {
      setFormError('일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
      setPhase('form');
      return;
    }

    if (res.ok) {
      setSeq(res.seq);
      setReferralCode(res.referralCode);
      if (res.eventId) trackFbLead(res.eventId, { content_name: 'ai_preview' });
      capture('ai_preview_registered', { seq: res.seq });
    } else if (res.reason === 'duplicate') {
      // 이미 등록된 분 — 그대로 미리보기를 다시 제공(반복 진입 허용)
      capture('ai_preview_returning');
    } else {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setFormError(res.message);
      setPhase('form');
      return;
    }

    await generate();
  }

  const categories = gender === 'male' ? MALE_JOB_CATEGORIES : FEMALE_JOB_CATEGORIES;
  const busy = phase === 'submitting' || phase === 'generating';

  // ── 결과 화면 ──────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="border border-hair-light bg-ivory p-7">
        <p className="font-sans-en text-center text-[10px] uppercase tracking-[0.18em] text-champagne">
          Your Preview
        </p>
        {seq != null ? (
          <p className="font-serif-kr mt-3 text-center text-xl font-bold text-ink-2">
            사전등록 완료 · <span className="text-champagne">#{seq}</span>번째 신청자
          </p>
        ) : (
          <p className="font-serif-kr mt-3 text-center text-xl font-bold text-ink-2">
            매칭 프로필 미리보기
          </p>
        )}

        {genFailed ? (
          <div className="mt-6 text-center">
            <p className="font-sans-kr text-[13px] text-gray">
              미리보기 생성이 잠시 지연되고 있어요. 다시 시도하거나, 다른 사진으로 올려보세요.
            </p>
            <button
              type="button"
              onClick={generate}
              className="mt-5 border border-ink-2 px-6 py-3 text-[13px] text-ink-2 transition-opacity hover:opacity-80"
            >
              다시 생성
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {results.map((r) => (
                <figure key={r.style} className="border border-hair-light">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.uri} alt={r.label} className="aspect-[3/4] w-full object-cover" />
                  <figcaption className="flex items-center justify-between px-2 py-2">
                    <span className="font-sans-kr text-[11px] text-gray">{r.label}</span>
                    <a
                      href={r.uri}
                      download={`theone-${r.style}.jpg`}
                      className="font-sans-en text-[10px] uppercase tracking-wider text-champagne hover:opacity-70"
                    >
                      저장
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="font-sans-kr mt-4 text-center text-[11px] leading-relaxed text-gray">
              본인 사진 기반으로 동일 인물을 유지해 생성됩니다. 입회 심사 시 운영자가 원본과
              대조합니다.
            </p>
          </>
        )}

        {referralCode && (
          <div className="mt-7 border-t border-hair-light pt-6">
            <p className="font-sans-kr text-center text-[12px] text-gray">나의 초대코드</p>
            <button
              type="button"
              onClick={() => {
                const link = `${window.location.origin}/?ref=${encodeURIComponent(referralCode)}`;
                navigator.clipboard?.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="mt-2 w-full border border-champagne px-4 py-4 font-mono text-lg tracking-wider text-ink-2 transition-opacity hover:opacity-80"
            >
              {referralCode}
            </button>
            <p className="font-sans-kr mt-2 text-center text-[11px] text-gray">
              {copied ? '초대 링크가 복사되었습니다' : '탭하면 초대 링크 복사 · 친구도 우선 혜택'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── 입력 폼 ────────────────────────────────────────────────
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="border border-hair-light bg-ivory p-7"
      noValidate
    >
      {/* 허니팟 */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          웹사이트
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* 사진 업로드 */}
      <span className="font-sans-en text-[10px] uppercase tracking-[0.14em] text-gray">Photo</span>
      <label
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center border border-dashed py-8 text-center transition-colors ${
          photo ? 'border-sage bg-ivory-2' : 'border-hair-light hover:border-gray-soft'
        }`}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.previewUrl}
            alt="업로드한 사진"
            className="h-28 w-28 border border-hair-light object-cover"
          />
        ) : (
          <span className="font-sans-kr text-[13px] text-gray">
            사진 한 장을 올려주세요
            <br />
            <span className="text-[11px] text-gray-soft">
              정면 · 얼굴이 잘 보이는 사진일수록 좋아요
            </span>
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickPhoto}
          disabled={busy}
        />
        {photo && (
          <span className="font-sans-kr mt-3 text-[11px] text-sage">사진 변경하려면 탭</span>
        )}
      </label>
      {photoError && <span className="mt-1 block text-[11px] text-terra">{photoError}</span>}

      {/* 이메일 */}
      <label className="mt-6 block">
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
          개인정보 수집·이용 및 출시 안내 수신에 동의합니다. 업로드한 사진은 미리보기 생성에만
          쓰이고 저장하지 않습니다.{' '}
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
        disabled={busy}
        className="mt-6 w-full bg-ink-2 py-4 text-sm text-ivory transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {phase === 'submitting'
          ? '등록 중…'
          : phase === 'generating'
            ? '프로필 생성 중… (최대 1분)'
            : '사전등록하고 미리보기 받기'}
      </button>
      <p className="font-sans-kr mt-3 text-center text-[11px] text-gray">
        등록하면 4가지 스타일의 매칭 프로필을 바로 받아보실 수 있어요.
      </p>
    </form>
  );
}
