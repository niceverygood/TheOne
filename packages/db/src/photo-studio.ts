/**
 * AI 스튜디오 비동기 잡 데이터 액세스 — 백그라운드 생성 + 완료 푸시.
 * 결과 이미지는 임시 보관소(받아가면 즉시 삭제, 미수령분은 1시간 TTL 파기).
 */
import { prisma } from './index';
import type { Prisma } from '@prisma/client';

export interface StudioJobImage {
  style: string;
  b64: string;
  mime: string;
}

export type StudioJobState =
  | { status: 'pending' }
  | { status: 'done'; images: StudioJobImage[] }
  | { status: 'failed'; error: string | null }
  | { status: 'not_found' };

/** 잡 생성(pending). 생성 시작 전 만료 잡을 함께 청소한다. */
export async function createPhotoStudioJob(
  styles: string[],
  pushToken?: string | null,
): Promise<string> {
  await prunePhotoStudioJobs().catch(() => {});
  const job = await prisma.photoStudioJob.create({
    data: { styles, pushToken: pushToken ?? null },
    select: { id: true },
  });
  return job.id;
}

/** 생성 완료 — 결과 저장(done). */
export async function completePhotoStudioJob(id: string, images: StudioJobImage[]): Promise<void> {
  await prisma.photoStudioJob.update({
    where: { id },
    data: { status: 'done', images: images as unknown as Prisma.InputJsonValue },
  });
}

/** 생성 실패(failed). */
export async function failPhotoStudioJob(id: string, error: string): Promise<void> {
  await prisma.photoStudioJob
    .update({ where: { id }, data: { status: 'failed', error: error.slice(0, 300) } })
    .catch(() => {});
}

/** 푸시 발송용 토큰만 조회(워커 내부). */
export async function getPhotoStudioPushToken(id: string): Promise<string | null> {
  const j = await prisma.photoStudioJob.findUnique({
    where: { id },
    select: { pushToken: true },
  });
  return j?.pushToken ?? null;
}

/**
 * 클라이언트 수령 — 상태 반환. done 이면 이미지를 돌려주고 즉시 삭제(임시 보관 원칙).
 * pending 은 그대로 두어 다음 폴링에 다시 조회한다.
 */
export async function consumePhotoStudioJob(id: string): Promise<StudioJobState> {
  const job = await prisma.photoStudioJob.findUnique({ where: { id } });
  if (!job) return { status: 'not_found' };
  if (job.status === 'pending') return { status: 'pending' };
  if (job.status === 'failed') {
    await prisma.photoStudioJob.delete({ where: { id } }).catch(() => {});
    return { status: 'failed', error: job.error };
  }
  // done — 받아가는 즉시 삭제
  const images = (job.images as unknown as StudioJobImage[] | null) ?? [];
  await prisma.photoStudioJob.delete({ where: { id } }).catch(() => {});
  return { status: 'done', images };
}

/** 미수령·고아 잡 파기 — 생성 1시간 경과분 삭제(임시 보관 TTL). */
export async function prunePhotoStudioJobs(): Promise<void> {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.photoStudioJob.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
