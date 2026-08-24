import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const THRESHOLD_MS = () =>
  parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '7', 10) * 24 * 60 * 60 * 1000;

export async function GET(request) {
  try {
    requireAuth(request, 'admin');

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status   = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo   = searchParams.get('dateTo');

    const where = {};
    if (category) where.category = category;
    if (status)   where.status   = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo)   where.createdAt.lte = new Date(dateTo);
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        resident: { select: { id: true, name: true, email: true, apartmentNo: true } },
        history: { orderBy: { changedAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const threshold = THRESHOLD_MS();
    const now = Date.now();
    const enriched = complaints.map((c) => ({
      ...c,
      isOverdue: c.status !== 'Resolved' && now - new Date(c.createdAt).getTime() > threshold,
    }));

    enriched.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return 0;
    });

    return NextResponse.json(enriched);
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
