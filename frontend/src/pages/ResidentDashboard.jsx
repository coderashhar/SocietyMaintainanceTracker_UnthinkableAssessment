import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import ComplaintCard from '../components/ComplaintCard.jsx';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    complaintsApi.myList()
      .then(({ data }) => setComplaints(data))
      .catch(() => setError('Failed to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  const open       = complaints.filter(c => c.status === 'Open').length;
  const inProgress = complaints.filter(c => c.status === 'InProgress').length;
  const resolved   = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Apt {user?.apartmentNo} · Resident Portal</p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">
          ➕ Raise Complaint
        </Link>
      </div>

      {/* Quick stats */}
      <div className="stat-grid">
        <div className="stat-card info">
          <span className="stat-icon">📋</span>
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card accent">
          <span className="stat-icon">🔵</span>
          <div className="stat-value">{open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card warning">
          <span className="stat-icon">🔄</span>
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card success">
          <span className="stat-icon">✅</span>
          <div className="stat-value">{resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Complaint list */}
      <div className="section-title">📋 My Complaints</div>

      {loading && (
        <div className="loading-center">
          <div className="spinner" /><span>Loading complaints…</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && complaints.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🏠</span>
          <h3>No complaints yet</h3>
          <p>Everything is in order! Raise a complaint if you notice any issue.</p>
          <Link to="/complaints/new" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Raise your first complaint
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {complaints.map(c => (
          <ComplaintCard key={c.id} complaint={c} showResident={false} />
        ))}
      </div>
    </div>
  );
}
