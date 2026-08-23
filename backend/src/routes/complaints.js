import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../middleware/upload.js';
import { sendStatusChangeEmail } from '../services/email.js';
import { getOverdueInterval } from '../utils/overdue.js';

const router = Router();

// All complaint routes require authentication
router.use(authenticateJWT);

const VALID_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Security',
  'Elevator',
  'Parking',
  'Noise',
  'Other',
];

const VALID_STATUSES = ['Open', 'InProgress', 'Resolved'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// ─── POST /api/complaints ─────────────────────────────────────────────────────
// Resident raises a new complaint (optional photo)
router.post(
  '/',
  requireRole('resident'),
  upload.single('photo'),
  uploadToCloudinary,
  async (req, res, next) => {
    try {
      const { category, description, priority } = req.body;

      if (!category || !description) {
        return res.status(400).json({ error: 'category and description are required' });
      }
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      if (priority && !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
      }

      const complaint = await prisma.complaint.create({
        data: {
          residentId: req.user.id,
          category,
          description,
          photoUrl: req.photoUrl || null,
          priority: priority || 'Low',
          status: 'Open',
        },
        include: {
          resident: { select: { id: true, name: true, email: true, apartmentNo: true } },
        },
      });

      // Write the initial status history entry
      await prisma.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          fromStatus: null,
          toStatus: 'Open',
          actorId: req.user.id,
          note: 'Complaint raised',
        },
      });

      res.status(201).json(complaint);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/complaints ──────────────────────────────────────────────────────
// Resident: view own complaints only
router.get('/', requireRole('resident'), async (req, res, next) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { residentId: req.user.id },
      include: {
        history: { orderBy: { changedAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/complaints/admin/all ───────────────────────────────────────────
// Admin: all complaints with optional filters; overdue pinned to top
router.get('/admin/all', requireRole('admin'), async (req, res, next) => {
  try {
    const { category, status, dateFrom, dateTo } = req.query;

    // Build Prisma where clause
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Fetch all filtered complaints (we'll sort overdue manually for portability)
    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        resident: { select: { id: true, name: true, email: true, apartmentNo: true } },
        history: { orderBy: { changedAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute overdue flag in JS (avoids Prisma raw complexity for listing)
    const thresholdMs = parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '7', 10) * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const enriched = complaints.map((c) => ({
      ...c,
      isOverdue: c.status !== 'Resolved' && now - new Date(c.createdAt).getTime() > thresholdMs,
    }));

    // Pin overdue complaints to top
    enriched.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return 0;
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/complaints/:id ──────────────────────────────────────────────────
// Resident: own complaint only. Admin: any complaint.
router.get('/:id', async (req, res, next) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        resident: { select: { id: true, name: true, email: true, apartmentNo: true } },
        history: {
          orderBy: { changedAt: 'asc' },
          include: { actor: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Residents can only view their own complaints
    if (req.user.role === 'resident' && complaint.residentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Attach overdue flag
    const thresholdMs = parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '7', 10) * 24 * 60 * 60 * 1000;
    const isOverdue = complaint.status !== 'Resolved' && Date.now() - new Date(complaint.createdAt).getTime() > thresholdMs;

    res.json({ ...complaint, isOverdue });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/complaints/:id/priority ──────────────────────────────────────
// Admin: set or update priority
router.patch('/:id/priority', requireRole('admin'), async (req, res, next) => {
  try {
    const { priority } = req.body;

    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    const existing = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Complaint not found' });

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { priority },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/complaints/:id/status ────────────────────────────────────────
// Admin: update status with optional note.
// RULE: If current status is Resolved, reject with 403 (locked). [Spec rule #3]
// Side-effect: write history row, send email to resident.
router.patch('/:id/status', requireRole('admin'), async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const existing = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { resident: { select: { email: true, name: true } } },
    });

    if (!existing) return res.status(404).json({ error: 'Complaint not found' });

    // ✦ LOCKED RULE: Resolved complaints cannot be edited — API-layer enforcement
    if (existing.status === 'Resolved') {
      return res.status(403).json({
        error: 'Complaint is already Resolved and cannot be updated. This is a closed record.',
      });
    }

    // No-op if same status
    if (existing.status === status) {
      return res.status(400).json({ error: `Complaint is already in ${status} status` });
    }

    const resolvedAt = status === 'Resolved' ? new Date() : undefined;

    // Run update + history insert in a transaction
    const [updated] = await prisma.$transaction([
      prisma.complaint.update({
        where: { id: req.params.id },
        data: { status, ...(resolvedAt ? { resolvedAt } : {}) },
      }),
      prisma.complaintStatusHistory.create({
        data: {
          complaintId: req.params.id,
          fromStatus: existing.status,
          toStatus: status,
          actorId: req.user.id,
          note: note || null,
        },
      }),
    ]);

    // ✦ EMAIL side-effect: synchronous, per spec
    await sendStatusChangeEmail({
      toEmail: existing.resident.email,
      toName: existing.resident.name,
      complaintId: existing.id,
      category: existing.category,
      fromStatus: existing.status,
      toStatus: status,
      note: note || null,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
