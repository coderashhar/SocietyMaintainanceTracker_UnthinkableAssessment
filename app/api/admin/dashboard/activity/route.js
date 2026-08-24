import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    requireAuth(request, 'admin');

    // Get last 10 status changes across all complaints
    const recentActivity = await prisma.complaintStatusHistory.findMany({
      take: 10,
      orderBy: { changedAt: 'desc' },
      include: {
        actor: {
          select: { name: true }
        },
        complaint: {
          select: { category: true, id: true }
        }
      }
    });

    return NextResponse.json({ activities: recentActivity });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[dashboard/activity]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
