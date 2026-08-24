import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    requireAuth(request, 'admin');

    const thresholdDays = parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '7', 10);

    const [statusCounts, categoryCounts, overdueResult, totalResidents] = await Promise.all([
      prisma.complaint.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM complaints
        WHERE status != 'Resolved'
          AND NOW() - created_at > (${thresholdDays} || ' days')::interval
      `,
      prisma.user.count({ where: { role: 'resident' } }),
    ]);

    const byStatus = { Open: 0, InProgress: 0, Resolved: 0 };
    let totalComplaints = 0;
    for (const row of statusCounts) {
      byStatus[row.status] = row._count._all;
      totalComplaints += row._count._all;
    }

    const byCategory = categoryCounts.map((row) => ({
      category: row.category,
      count: row._count._all,
    }));

    const overdueCount = overdueResult[0]?.count ?? 0;

    return NextResponse.json({
      totalComplaints,
      totalResidents,
      byStatus,
      byCategory,
      overdueCount,
      overdueThresholdDays: thresholdDays,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[dashboard]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
