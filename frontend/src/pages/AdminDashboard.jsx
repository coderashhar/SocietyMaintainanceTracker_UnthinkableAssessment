import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/index.js';

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

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
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Society overview and complaint analytics</p>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="stat-grid">
        <div className="stat-card info">
          <span className="stat-icon">📋</span>
          <div className="stat-value">{data.totalComplaints}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card accent">
          <span className="stat-icon">🔵</span>
          <div className="stat-value">{data.byStatus.Open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card warning">
          <span className="stat-icon">🔄</span>
          <div className="stat-value">{data.byStatus.InProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card success">
          <span className="stat-icon">✅</span>
          <div className="stat-value">{data.byStatus.Resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card danger">
          <span className="stat-icon">⚠️</span>
          <div className="stat-value">{data.overdueCount}</div>
          <div className="stat-label">Overdue (&gt;{data.overdueThresholdDays}d)</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-value">{data.totalResidents}</div>
          <div className="stat-label">Residents</div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📂 Complaints by Category</h2>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            {data.totalComplaints} total
          </span>
        </div>

        {data.byCategory.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No complaints yet.</p>
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

      {data.overdueCount > 0 && (
        <div className="overdue-banner" style={{ marginTop: '20px' }}>
          ⚠ <strong>{data.overdueCount}</strong> complaint(s) are overdue (&gt;{data.overdueThresholdDays} days unresolved).
          {' '}<a href="/admin/complaints?status=Open">View overdue →</a>
        </div>
      )}
    </div>
  );
}
