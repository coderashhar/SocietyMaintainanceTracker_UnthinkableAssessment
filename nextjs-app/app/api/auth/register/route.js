import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password, role, apartmentNo } = await request.json();

    if (!name || !email || !password || !apartmentNo) {
      return NextResponse.json(
        { error: 'name, email, password, and apartmentNo are required' },
        { status: 400 }
      );
    }

    const assignedRole = role === 'admin' ? 'resident' : (role || 'resident');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: assignedRole, apartmentNo },
      select: { id: true, name: true, email: true, role: true, apartmentNo: true },
    });

    const token = signToken({
      id: user.id, email: user.email, role: user.role,
      name: user.name, apartmentNo: user.apartmentNo,
    });

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
