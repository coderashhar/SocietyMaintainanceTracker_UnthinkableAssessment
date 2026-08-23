import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { getOverdueThresholdDays } from '../utils/overdue.js';

const router = Router();

// Dashboard is admin-only
router.use(authenticateJWT);
router.use(requireRole('admin'));

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
// Returns:
//   - counts by status (Open, InProgress, Resolved)
//   - counts by category
//   - overdue count (computed via $queryRaw — spec requirement)
//   - total complaint count
//   - total resident count
router.get('/', async (req, res, next) => {
  try {
    const thresholdDays = getOverdueThresholdDays();

    // Run all aggregations in parallel for performance
    const [
      statusCounts,
      categoryCounts,
      overdueResult,
      totalResidents,
    ] = await Promise.all([
      // Counts by status
      prisma.complaint.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      // Counts by category
      prisma.complaint.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
      }),

      // ✦ Overdue count via $queryRaw — OVERDUE_THRESHOLD_DAYS is the configurable threshold
      // Overdue = not Resolved AND age > threshold. NOT stored — computed at query time (spec rule #1).
      prisma.$queryRaw`
        SELECT COUNT(*)::int AS count
        FROM complaints
        WHERE status != 'Resolved'
          AND NOW() - created_at > (${thresholdDays} || ' days')::interval
      `,

      // Total residents
      prisma.user.count({ where: { role: 'resident' } }),
    ]);

    // Shape status counts into a clean object
    const byStatus = { Open: 0, InProgress: 0, Resolved: 0 };
    let totalComplaints = 0;
    for (const row of statusCounts) {
      byStatus[row.status] = row._count._all;
      totalComplaints += row._count._all;
    }

    // Shape category counts
    const byCategory = categoryCounts.map((row) => ({
      category: row.category,
      count: row._count._all,
    }));

    const overdueCount = overdueResult[0]?.count ?? 0;

    res.json({
      totalComplaints,
      totalResidents,
      byStatus,
      byCategory,
      overdueCount,
      overdueThresholdDays: thresholdDays,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
