import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendImportantNoticeEmail } from '@/lib/email';

export async function GET(request) {
  try {
    requireAuth(request);
    const notices = await prisma.notice.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: [{ isImportant: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(notices);
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    requireAuth(request, 'admin');
    const user = requireAuth(request);
    const { title, body, isImportant } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: { title, body, isImportant: Boolean(isImportant), createdBy: user.id },
      include: { author: { select: { id: true, name: true } } },
    });

    if (notice.isImportant) {
      const residents = await prisma.user.findMany({
        where: { role: 'resident' },
        select: { email: true },
      });
      await sendImportantNoticeEmail({
        recipients: residents.map((r) => r.email),
        noticeTitle: title,
        noticeBody: body,
      });
    }

    return NextResponse.json(notice, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
