import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

export async function PATCH(request, { params }) {
  try {
    requireAuth(request, 'admin');
    const { id } = await params;
    const { priority } = await request.json();

    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });

    const updated = await prisma.complaint.update({ where: { id }, data: { priority } });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
