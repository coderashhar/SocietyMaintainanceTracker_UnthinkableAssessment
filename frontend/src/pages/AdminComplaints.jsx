import { useState, useEffect, useCallback } from 'react';
import { complaintsApi } from '../api/index.js';
import ComplaintCard from '../components/ComplaintCard.jsx';

const CATEGORIES = ['', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Noise', 'Other'];
const STATUSES   = ['', 'Open', 'InProgress', 'Resolved'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [filters, setFilters] = useState({
    category: '', status: '', dateFrom: '', dateTo: '',
  });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.status)   params.status   = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo)   params.dateTo   = filters.dateTo;

      const { data } = await complaintsApi.adminList(params);
      setComplaints(data);
    } catch {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleFilterChange = (e) =>
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleReset = () =>
    setFilters({ category: '', status: '', dateFrom: '', dateTo: '' });

  const overdueCount = complaints.filter(c => c.isOverdue).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Complaints</h1>
          <p className="page-subtitle">{complaints.length} complaint(s) found</p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="overdue-banner">
          <strong>{overdueCount}</strong> overdue complaint(s) are pinned to the top of this list.
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label" htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            className="form-control"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            className="form-control"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s ? (s === 'InProgress' ? 'In Progress' : s) : 'All Statuses'}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="filter-from">From Date</label>
          <input
            id="filter-from"
            className="form-control"
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="filter-to">To Date</label>
          <input
            id="filter-to"
            className="form-control"
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
          />
        </div>

        <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ alignSelf: 'flex-end', marginBottom: '14px' }}>
          Reset
        </button>
      </div>

      {loading && (
        <div className="loading-center"><div className="spinner" /><span>Loading…</span></div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && complaints.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No complaints found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      )}

      <div className="complaint-list">
        {complaints.map(c => (
          <ComplaintCard key={c.id} complaint={c} showResident={true} />
        ))}
      </div>
    </div>
  );
}
