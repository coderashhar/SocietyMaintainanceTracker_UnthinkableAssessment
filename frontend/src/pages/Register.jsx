import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const APARTMENT_REGEX = /^[A-Z0-9\-]+$/i;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', apartmentNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if (!APARTMENT_REGEX.test(form.apartmentNo)) {
      return setError('Apartment number can only contain letters, numbers and hyphens');
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        apartmentNo: form.apartmentNo.toUpperCase(),
        role: 'resident',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🏢</span>
          <h1>Society Maintenance</h1>
          <p>Resident Registration</p>
        </div>

        <h2 className="auth-title">Create Account</h2>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="form-control"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-apt">Apartment Number</label>
            <input
              id="reg-apt"
              className="form-control"
              type="text"
              name="apartmentNo"
              value={form.apartmentNo}
              onChange={handleChange}
              placeholder="A-101"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className="form-control"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
