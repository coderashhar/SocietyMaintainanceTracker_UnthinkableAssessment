import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { sendImportantNoticeEmail } from '../services/email.js';

const router = Router();

// All notice routes require authentication
router.use(authenticateJWT);

// ─── GET /api/notices ─────────────────────────────────────────────────────────
// All authenticated users can view notices.
// Sort: important notices first, then by created_at DESC (spec rule #4)
router.get('/', async (req, res, next) => {
  try {
    const notices = await prisma.notice.findMany({
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: [
        { isImportant: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    res.json(notices);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/notices ────────────────────────────────────────────────────────
// Admin: create a notice. If is_important, email all residents.
router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { title, body, isImportant } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        body,
        isImportant: Boolean(isImportant),
        createdBy: req.user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    // ✦ EMAIL side-effect: only if isImportant, synchronous (spec rule #5)
    if (notice.isImportant) {
      const residents = await prisma.user.findMany({
        where: { role: 'resident' },
        select: { email: true },
      });
      const emails = residents.map((r) => r.email);
      await sendImportantNoticeEmail({
        recipients: emails,
        noticeTitle: title,
        noticeBody: body,
      });
    }

    res.status(201).json(notice);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/notices/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!notice) return res.status(404).json({ error: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    next(err);
  }
});

export default router;
