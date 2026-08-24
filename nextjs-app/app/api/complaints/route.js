import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VALID_CATEGORIES = ['Plumbing','Electrical','Cleaning','Security','Elevator','Parking','Noise','Other'];
const VALID_PRIORITIES  = ['Low', 'Medium', 'High'];

// ─── GET /api/complaints — resident: own complaints ───────────────────────────
export async function GET(request) {
  try {
    const user = requireAuth(request, 'resident');
    const complaints = await prisma.complaint.findMany({
      where: { residentId: user.id },
      include: { history: { orderBy: { changedAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(complaints);
  } catch (err) {
    if (err instanceof Response) return err;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST /api/complaints — resident: raise complaint (JSON body + optional photoUrl) ──
export async function POST(request) {
  try {
    const user = requireAuth(request, 'resident');
    const body = await request.json();
    const { category, description, priority, photoUrl } = body;

    if (!category || !description) {
      return NextResponse.json({ error: 'category and description are required' }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        residentId: user.id,
        category,
        description,
        photoUrl: photoUrl || null,
        priority: priority || 'Low',
        status: 'Open',
      },
      include: {
        resident: { select: { id: true, name: true, email: true, apartmentNo: true } },
      },
    });

    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: complaint.id,
        fromStatus: null,
        toStatus: 'Open',
        actorId: user.id,
        note: 'Complaint raised',
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[POST /api/complaints]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
