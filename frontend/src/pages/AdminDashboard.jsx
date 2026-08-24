import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/index.js';

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    dashboardApi.get()
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading dashboard…</span></div>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  if (!data)   return null;

  const maxCategoryCount = Math.max(...(data.byCategory.map(c => c.count)), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Society overview and complaint analytics</p>
        </div>
      </div>

      {/* Stat cards — 3+3 grid */}
      <div className="stat-grid">
        <div className="stat-card total">
          <div className="stat-value">{data.totalComplaints}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card open">
          <div className="stat-value">{data.byStatus.Open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card inprogress">
          <div className="stat-value">{data.byStatus.InProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-value">{data.byStatus.Resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card overdue">
          <div className="stat-value">{data.overdueCount}</div>
          <div className="stat-label">Overdue</div>
          <div className="stat-note">&gt;{data.overdueThresholdDays} days unresolved</div>
        </div>
        <div className="stat-card residents">
          <div className="stat-value">{data.totalResidents}</div>
          <div className="stat-label">Residents</div>
        </div>
      </div>

      {/* Overdue alert */}
      {data.overdueCount > 0 && (
        <div className="overdue-banner">
          <strong>{data.overdueCount}</strong> complaint(s) are overdue (&gt;{data.overdueThresholdDays} days unresolved).{' '}
          <a href="/admin/complaints">View overdue →</a>
        </div>
      )}

      {/* Category breakdown — CSS bar chart */}
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
            {data.byCategory.map(({ category, count }) => (
              <div key={category} className="category-bar-item">
                <div className="category-bar-label">
                  <span>{category}</span>
                  <span>{count}</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
