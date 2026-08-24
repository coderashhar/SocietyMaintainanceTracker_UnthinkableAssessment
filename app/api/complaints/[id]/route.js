import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendStatusChangeEmail } from '@/lib/email';

const VALID_STATUSES   = ['Open', 'InProgress', 'Resolved'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const THRESHOLD_MS = () =>
  parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '7', 10) * 24 * 60 * 60 * 1000;

// ─── GET /api/complaints/[id] ─────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const user = requireAuth(request);
    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        resident: { select: { id: true, name: true, email: true, apartmentNo: true } },
        history: {
          orderBy: { changedAt: 'asc' },
          include: { actor: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });

    if (user.role === 'resident' && complaint.residentId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const isOverdue = complaint.status !== 'Resolved' &&
      Date.now() - new Date(complaint.createdAt).getTime() > THRESHOLD_MS();

    return NextResponse.json({ ...complaint, isOverdue });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH /api/complaints/[id] — not used directly; sub-routes handle status/priority ──
// Kept as placeholder to satisfy Next.js route file expectations
export async function PATCH(request, { params }) {
  return NextResponse.json({ error: 'Use /status or /priority sub-routes' }, { status: 400 });
}
