import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsApi } from '../api/index.js';

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Security', 'Elevator', 'Parking', 'Noise', 'Other'];
const PRIORITIES  = ['Low', 'Medium', 'High'];

export default function RaiseComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: '', description: '', priority: 'Low',
  });
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return setError('Photo must be under 5 MB');
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category) return setError('Please select a category');
    if (!form.description.trim()) return setError('Description is required');

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('category',    form.category);
      fd.append('description', form.description);
      fd.append('priority',    form.priority);
      if (photo) fd.append('photo', photo);

      const { data } = await complaintsApi.raise(fd);
      setSuccess(true);
      setTimeout(() => navigate(`/complaints/${data.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Raise a Complaint</h1>
          <p className="page-subtitle">Report an issue in your apartment or common areas</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          ✅ Complaint submitted successfully! Redirecting…
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate encType="multipart/form-data">
          <div className="form-group">
            <label className="form-label" htmlFor="comp-category">Category *</label>
            <select
              id="comp-category"
              className="form-control"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">— Select a category —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="comp-priority">Priority</label>
            <select
              id="comp-priority"
              className="form-control"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="comp-desc">Description *</label>
            <textarea
              id="comp-desc"
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail — location, severity, since when…"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="comp-photo">Photo (optional, max 5 MB)</label>
            <input
              id="comp-photo"
              className="form-control"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              style={{ padding: '8px' }}
            />
            {preview && (
              <div className="photo-upload-preview" style={{ marginTop: '10px' }}>
                <img src={preview} alt="Preview" />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || success}
              id="raise-complaint-btn"
            >
              {loading ? 'Submitting…' : '📨 Submit Complaint'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
