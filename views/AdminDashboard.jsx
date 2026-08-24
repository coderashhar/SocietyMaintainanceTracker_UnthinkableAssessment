'use client';
import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api';
import MetricCard from '@/components/MetricCard.jsx';
import TrendChart from '@/components/TrendChart.jsx';
import DonutChart from '@/components/DonutChart.jsx';
import ActivityFeed from '@/components/ActivityFeed.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      dashboardApi.get(),
      dashboardApi.getTrends(),
      dashboardApi.getActivity()
    ])
      .then(([dashRes, trendsRes, activityRes]) => {
        setData(dashRes.data);
        setTrends(trendsRes.data);
        setActivity(activityRes.data);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading dashboard…</span></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data || !trends) return null;

  const maxCategoryCount = Math.max(...(data.byCategory.map(c => c.count)), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Society overview and complaint analytics</p>
        </div>
      </div>

      {/* Key Metrics — Enhanced stat cards */}
      <div className="dashboard-metrics-grid">
        <MetricCard
          label="Total Complaints"
          value={data.totalComplaints}
          color="total"
        />
        <MetricCard
          label="Open"
          value={data.byStatus.Open}
          color="open"
        />
        <MetricCard
          label="In Progress"
          value={data.byStatus.InProgress}
          color="inprogress"
        />
        <MetricCard
          label="Resolved"
          value={data.byStatus.Resolved}
          color="resolved"
        />
        <MetricCard
          label="Overdue"
          value={data.overdueCount}
          color="overdue"
          subtitle={`>${data.overdueThresholdDays} days unresolved`}
        />
        <MetricCard
          label="Residents"
          value={data.totalResidents}
          color="residents"
        />
      </div>

      {/* Performance Metrics */}
      <div className="dashboard-performance-grid">
        <div className="performance-card">
          <div className="performance-value">{trends.resolutionRate}%</div>
          <div className="performance-label">Resolution Rate</div>
          <div className="performance-desc">Percentage of complaints resolved</div>
        </div>
        <div className="performance-card">
          <div className="performance-value">{trends.avgResolutionDays}</div>
          <div className="performance-label">Avg Resolution Time</div>
          <div className="performance-desc">Days to resolve complaints</div>
        </div>
        <div className="performance-card">
          <div className="performance-value">{trends.avgResponseHours}h</div>
          <div className="performance-label">Avg Response Time</div>
          <div className="performance-desc">Hours to first status update</div>
        </div>
      </div>

      {/* Overdue alert */}
      {data.overdueCount > 0 && (
        <div className="overdue-banner">
          <strong>{data.overdueCount}</strong> complaint(s) are overdue (&gt;{data.overdueThresholdDays} days unresolved).{' '}
          <a href="/admin/complaints">View overdue →</a>
        </div>
      )}

      {/* Two-column layout for charts */}
      <div className="dashboard-charts-grid">
        {/* Complaint Trends */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Complaint Trends</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last 6 weeks</span>
          </div>
          <TrendChart data={trends.weeklyTrend} height={200} />
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Priority Distribution</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active complaints</span>
          </div>
          {trends.priorityData.length > 0 ? (
            <DonutChart data={trends.priorityData} size={140} />
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No active complaints</p>
          )}
        </div>
      </div>

      {/* Two-column layout for category & activity */}
      <div className="dashboard-charts-grid">
        {/* Category breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Complaints by Category</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {data.totalComplaints} total
            </span>
          </div>

          {data.byCategory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No complaints yet.</p>
          ) : (
            <div className="category-bar-list">
              {data.byCategory.map(({ category, count }) => {
                const percentage = Math.round((count / data.totalComplaints) * 100);
                return (
                  <div key={category} className="category-bar-item">
                    <div className="category-bar-label">
                      <span>{category}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last 10 updates</span>
          </div>
          <ActivityFeed activities={activity?.activities || []} />
        </div>
      </div>
    </div>
  );
}
