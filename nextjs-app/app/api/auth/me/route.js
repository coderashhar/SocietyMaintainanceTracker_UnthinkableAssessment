import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = requireAuth(request);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, apartmentNo: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[me]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
