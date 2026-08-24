'use client';
import { useState, useEffect } from 'react';
import { noticesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function NoticeBoard() {
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';

  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ title: '', body: '', isImportant: false });
  const [creating, setCreating]   = useState(false);
  const [createErr, setCreateErr] = useState('');
  const [createOk, setCreateOk]   = useState('');

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-subtitle">Society announcements and updates</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(v => !v)}
            id="toggle-notice-form-btn"
          >
            {showForm ? 'Cancel' : '+ Post Notice'}
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
              <label className="form-label" htmlFor="notice-title">Title</label>
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
              <label className="form-label" htmlFor="notice-body">Body</label>
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
                style={{ width: '16px', height: '16px', accentColor: '#EF4444', cursor: 'pointer' }}
              />
              <label htmlFor="notice-important" style={{ fontSize: '14px', color: 'var(--text)', cursor: 'pointer' }}>
                Mark as Important{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>(sends email to all residents)</span>
              </label>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
              id="post-notice-btn"
            >
              {creating ? 'Posting…' : 'Post Notice'}
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
          <div className="empty-icon" style={{ fontSize: '32px', fontWeight: '300', color: 'var(--text-faint)' }}>—</div>
          <h3>No notices yet</h3>
          {isAdmin && <p>Post the first notice using the button above.</p>}
        </div>
      )}

      {/* Notice Board - Cork board aesthetic */}
      {!loading && !error && notices.length > 0 && (
        <div className="notice-board">
          {notices.map((notice, index) => (
            <article
              key={notice.id}
              className={`notice-board-card${notice.isImportant ? ' important' : ''}`}
              style={{ '--notice-index': index }}
            >
              {/* Pin at top */}
              <div className="notice-pin" data-important={notice.isImportant} />

              {/* Notice content */}
              <div className="notice-board-header">
                {notice.isImportant && (
                  <span className="notice-important-badge">Important</span>
                )}
                <h3 className="notice-board-title">{notice.title}</h3>
              </div>

              <p className="notice-board-body">{notice.body}</p>

              <div className="notice-board-footer">
                <div className="notice-date-stamp">{formatDate(notice.createdAt)}</div>
                <div className="notice-author">— {notice.author?.name || 'Admin'}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
