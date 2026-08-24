import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendStatusChangeEmail } from '@/lib/email';

const VALID_STATUSES = ['Open', 'InProgress', 'Resolved'];

export async function PATCH(request, { params }) {
  try {
    const actor = requireAuth(request, 'admin');
    const { id } = await params;
    const { status, note } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await prisma.complaint.findUnique({
      where: { id },
      include: { resident: { select: { email: true, name: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });

    // LOCKED RULE: Resolved complaints cannot be edited
    if (existing.status === 'Resolved') {
      return NextResponse.json(
        { error: 'Complaint is already Resolved and cannot be updated. This is a closed record.' },
        { status: 403 }
      );
    }

    if (existing.status === status) {
      return NextResponse.json({ error: `Complaint is already in ${status} status` }, { status: 400 });
    }

    const resolvedAt = status === 'Resolved' ? new Date() : undefined;

    const [updated] = await prisma.$transaction([
      prisma.complaint.update({
        where: { id },
        data: { status, ...(resolvedAt ? { resolvedAt } : {}) },
      }),
      prisma.complaintStatusHistory.create({
        data: {
          complaintId: id,
          fromStatus: existing.status,
          toStatus: status,
          actorId: actor.id,
          note: note || null,
        },
      }),
    ]);

    await sendStatusChangeEmail({
      toEmail: existing.resident.email,
      toName: existing.resident.name,
      complaintId: existing.id,
      category: existing.category,
      fromStatus: existing.status,
      toStatus: status,
      note: note || null,
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[PATCH /status]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
