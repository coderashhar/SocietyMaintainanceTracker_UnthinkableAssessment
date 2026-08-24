import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    requireAuth(request, 'admin');

    // Get weekly complaint trends for the last 6 weeks
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    const complaints = await prisma.complaint.findMany({
      where: {
        createdAt: { gte: sixWeeksAgo }
      },
      select: {
        createdAt: true,
        resolvedAt: true,
        status: true,
        priority: true
      }
    });

    // Group by week
    const weeklyData = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekLabel = `W${6 - i}`;
      weeklyData[weekLabel] = { label: weekLabel, value: 0, resolved: 0 };
    }

    complaints.forEach(c => {
      const weeksAgo = Math.floor((now - new Date(c.createdAt)) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo >= 0 && weeksAgo < 6) {
        const weekLabel = `W${6 - weeksAgo}`;
        if (weeklyData[weekLabel]) {
          weeklyData[weekLabel].value++;
          if (c.status === 'Resolved') {
            weeklyData[weekLabel].resolved++;
          }
        }
      }
    });

    const weeklyTrend = Object.values(weeklyData);

    // Calculate resolution metrics
    const resolvedComplaints = await prisma.complaint.findMany({
      where: {
        status: 'Resolved',
        resolvedAt: { not: null }
      },
      select: {
        createdAt: true,
        resolvedAt: true
      }
    });

    let totalResolutionTime = 0;
    resolvedComplaints.forEach(c => {
      const resolutionTime = (new Date(c.resolvedAt) - new Date(c.createdAt)) / (24 * 60 * 60 * 1000);
      totalResolutionTime += resolutionTime;
    });

    const avgResolutionDays = resolvedComplaints.length > 0
      ? Math.round(totalResolutionTime / resolvedComplaints.length)
      : 0;

    // Priority distribution
    const priorityDist = await prisma.complaint.groupBy({
      by: ['priority'],
      _count: { _all: true },
      where: { status: { not: 'Resolved' } }
    });

    const priorityData = priorityDist.map(p => ({
      label: p.priority,
      value: p._count._all,
      color: p.priority === 'High' ? '#EF4444' : p.priority === 'Medium' ? '#F59E0B' : '#10B981'
    }));

    // Calculate resolution rate
    const totalComplaints = await prisma.complaint.count();
    const resolvedCount = await prisma.complaint.count({ where: { status: 'Resolved' } });
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

    // Response time (time to first status change)
    const complaintsWithHistory = await prisma.complaint.findMany({
      where: {
        history: {
          some: {}
        }
      },
      select: {
        createdAt: true,
        history: {
          orderBy: { changedAt: 'asc' },
          take: 1
        }
      }
    });

    let totalResponseTime = 0;
    let responseCount = 0;
    complaintsWithHistory.forEach(c => {
      if (c.history.length > 0) {
        const responseTime = (new Date(c.history[0].changedAt) - new Date(c.createdAt)) / (60 * 60 * 1000);
        totalResponseTime += responseTime;
        responseCount++;
      }
    });

    const avgResponseHours = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    return NextResponse.json({
      weeklyTrend,
      avgResolutionDays,
      avgResponseHours,
      resolutionRate,
      priorityData
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[dashboard/trends]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
