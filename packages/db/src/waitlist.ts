/**
 * 웨이팅리스트 데이터 액세스. 앱/어드민이 공유.
 */
import { prisma } from './index';
import type { Prisma, Waitlist } from '@prisma/client';

export class DuplicateEmailError extends Error {
  constructor() {
    super('DUPLICATE_EMAIL');
    this.name = 'DuplicateEmailError';
  }
}

/** 사전등록 1건 생성. 이메일 중복 시 DuplicateEmailError. */
export async function createWaitlistEntry(data: Prisma.WaitlistCreateInput): Promise<Waitlist> {
  try {
    return await prisma.waitlist.create({ data });
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      throw new DuplicateEmailError();
    }
    throw e;
  }
}

/** 확인 메일 클릭 처리 */
export async function confirmWaitlistEntry(email: string): Promise<void> {
  await prisma.waitlist.updateMany({
    where: { email, confirmedAt: null },
    data: { confirmedAt: new Date() },
  });
}

export interface WaitlistStats {
  total: number;
  yesterday: number;
  male: number;
  female: number;
  topJobCategory: { jobCategory: string; count: number } | null;
  /** 최근 14일 일별 등록 수 (YYYY-MM-DD) */
  daily: { date: string; count: number }[];
}

export async function getWaitlistStats(): Promise<WaitlistStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const [total, male, female, yesterday, grouped, recent] = await Promise.all([
    prisma.waitlist.count(),
    prisma.waitlist.count({ where: { gender: 'male' } }),
    prisma.waitlist.count({ where: { gender: 'female' } }),
    prisma.waitlist.count({
      where: { createdAt: { gte: startOfYesterday, lt: startOfToday } },
    }),
    prisma.waitlist.groupBy({
      by: ['jobCategory'],
      _count: { jobCategory: true },
      orderBy: { _count: { jobCategory: 'desc' } },
      take: 1,
    }),
    prisma.waitlist.findMany({
      where: { createdAt: { gte: new Date(startOfToday.getTime() - 13 * 86400000) } },
      select: { createdAt: true },
    }),
  ]);

  const byDay = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 86400000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of recent) {
    const key = r.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const top = grouped[0];
  return {
    total,
    yesterday,
    male,
    female,
    topJobCategory: top ? { jobCategory: top.jobCategory, count: top._count.jobCategory } : null,
    daily: [...byDay.entries()].map(([date, count]) => ({ date, count })),
  };
}

export interface WaitlistRow {
  seq: number;
  email: string;
  gender: string;
  jobCategory: string;
  referralCode: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: Date;
  confirmedAt: Date | null;
}

export async function listWaitlist(opts?: {
  jobCategory?: string;
  utmSource?: string;
  take?: number;
}): Promise<WaitlistRow[]> {
  return prisma.waitlist.findMany({
    where: {
      ...(opts?.jobCategory ? { jobCategory: opts.jobCategory } : {}),
      ...(opts?.utmSource ? { utmSource: opts.utmSource } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: opts?.take ?? 500,
    select: {
      seq: true,
      email: true,
      gender: true,
      jobCategory: true,
      referralCode: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      createdAt: true,
      confirmedAt: true,
    },
  });
}
