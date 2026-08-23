import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

const STATUSES   = ['Open', 'InProgress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function ComplaintDetail() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const isAdmin      = user?.role === 'admin';

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Admin action state
  const [newStatus,   setNewStatus]   = useState('');
  const [statusNote,  setStatusNote]  = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [updating, setUpdating]       = useState(false);
  const [actionMsg, setActionMsg]     = useState('');
  const [actionErr, setActionErr]     = useState('');

  const fetchComplaint = () => {
    const fn = isAdmin
      ? complaintsApi.getById(id)
      : complaintsApi.getById(id);
    fn.then(({ data }) => {
      setComplaint(data);
      setNewStatus(data.status);
      setNewPriority(data.priority);
    })
      .catch(() => setError('Complaint not found or access denied'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setActionMsg(''); setActionErr('');
    if (newStatus === complaint.status) return setActionErr('Status is already ' + newStatus);
    setUpdating(true);
    try {
      await complaintsApi.updateStatus(id, { status: newStatus, note: statusNote });
      setActionMsg('Status updated successfully');
      setStatusNote('');
      fetchComplaint();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async () => {
    setActionMsg(''); setActionErr('');
    if (newPriority === complaint.priority) return;
    setUpdating(true);
    try {
      await complaintsApi.updatePriority(id, { priority: newPriority });
      setActionMsg('Priority updated');
      fetchComplaint();
    } catch (err) {
      setActionErr(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /><span>Loading…</span></div>;
  if (error)   return <div className="alert alert-error" style={{ maxWidth: '640px' }}>{error}</div>;
  if (!complaint) return null;

  const backUrl = isAdmin ? '/admin/complaints' : '/dashboard';
  const createdDate = new Date(complaint.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const resolvedDate = complaint.resolvedAt
    ? new Date(complaint.resolvedAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div style={{ maxWidth: '800px' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(backUrl)} style={{ marginBottom: '16px' }}>
        ← Back
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{complaint.category} Complaint</h1>
          <p className="page-subtitle">#{complaint.id.slice(-8).toUpperCase()}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {complaint.isOverdue && <span className="badge badge-overdue">⚠ Overdue</span>}
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      {/* Details */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="detail-grid">
          <div className="detail-field">
            <label>Resident</label>
            <p>{complaint.resident?.name} (Apt {complaint.resident?.apartmentNo})</p>
          </div>
          <div className="detail-field">
            <label>Category</label>
            <p>{complaint.category}</p>
          </div>
          <div className="detail-field">
            <label>Created</label>
            <p>{createdDate}</p>
          </div>
          <div className="detail-field">
            <label>Resolved</label>
            <p>{resolvedDate || '—'}</p>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div className="detail-field">
            <label>Description</label>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{complaint.description}</p>
          </div>
        </div>

        {complaint.photoUrl && (
          <img src={complaint.photoUrl} alt="Complaint photo" className="complaint-photo" />
        )}
      </div>

      {/* Admin action panel */}
      {isAdmin && complaint.status !== 'Resolved' && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>🛠 Admin Actions</h2>

          {actionMsg && <div className="alert alert-success">{actionMsg}</div>}
          {actionErr && <div className="alert alert-error">{actionErr}</div>}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Priority update */}
            <div style={{ flex: '1', minWidth: '180px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-priority">Set Priority</label>
                <select
                  id="admin-priority"
                  className="form-control"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePriorityUpdate}
                disabled={updating || newPriority === complaint.priority}
                id="update-priority-btn"
              >
                Update Priority
              </button>
            </div>

            {/* Status update */}
            <form onSubmit={handleStatusUpdate} style={{ flex: '2', minWidth: '280px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-status">Update Status</label>
                <select
                  id="admin-status"
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s === 'InProgress' ? 'In Progress' : s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-note">Note (optional)</label>
                <textarea
                  id="admin-note"
                  className="form-control"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note for the resident…"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={updating}
                id="update-status-btn"
              >
                {updating ? 'Updating…' : 'Update Status'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAdmin && complaint.status === 'Resolved' && (
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          🔒 This complaint is <strong>Resolved</strong> and locked. No further status changes are allowed.
        </div>
      )}

      {/* Status Timeline */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '20px' }}>🕐 Status History</h2>
        <StatusTimeline history={complaint.history || []} />
      </div>
    </div>
  );
}
