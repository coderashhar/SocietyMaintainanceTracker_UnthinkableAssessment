import { useState, useEffect } from 'react';
import { noticesApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import NoticeCard from '../components/NoticeCard.jsx';

export default function NoticeBoard() {
  const { user }        = useAuth();
  const isAdmin         = user?.role === 'admin';

  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Create form state (admin only)
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', body: '', isImportant: false });
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [createOk, setCreateOk]  = useState('');

  const fetchNotices = () => {
    noticesApi.list()
      .then(({ data }) => setNotices(data))
      .catch(() => setError('Failed to load notices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateErr(''); setCreateOk('');
    if (!form.title.trim() || !form.body.trim()) {
      return setCreateErr('Title and body are required');
    }
    setCreating(true);
    try {
      await noticesApi.create(form);
      setCreateOk('Notice posted successfully!');
      setForm({ title: '', body: '', isImportant: false });
      setShowForm(false);
      fetchNotices();
    } catch (err) {
      setCreateErr(err.response?.data?.error || 'Failed to post notice');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📢 Notice Board</h1>
          <p className="page-subtitle">Society announcements and updates</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(v => !v)}
            id="toggle-notice-form-btn"
          >
            {showForm ? '✕ Cancel' : '+ Post Notice'}
          </button>
        )}
      </div>

      {createOk && <div className="alert alert-success">{createOk}</div>}

      {/* Admin create form */}
      {isAdmin && showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>New Notice</h2>
          {createErr && <div className="alert alert-error">{createErr}</div>}
          <form onSubmit={handleCreateSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="notice-title">Title *</label>
              <input
                id="notice-title"
                className="form-control"
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="notice-body">Body *</label>
              <textarea
                id="notice-body"
                className="form-control"
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Notice content…"
                rows={4}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="notice-important"
                type="checkbox"
                checked={form.isImportant}
                onChange={e => setForm({ ...form, isImportant: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-danger)', cursor: 'pointer' }}
              />
              <label htmlFor="notice-important" style={{ fontSize: '14px', color: 'var(--color-text)', cursor: 'pointer' }}>
                Mark as Important{' '}
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  (emails all residents)
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
              id="post-notice-btn"
            >
              {creating ? 'Posting…' : '📢 Post Notice'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="loading-center"><div className="spinner" /><span>Loading notices…</span></div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && notices.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No notices yet</h3>
          {isAdmin && <p>Post the first notice using the button above.</p>}
        </div>
      )}

      {/* Notices sorted: important first, then by date (backend-enforced order) */}
      {notices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  );
}
