'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const APARTMENT_REGEX = /^[A-Z0-9\-]+$/i;

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', apartmentNo: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      router.push('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* Left — image panel */}
      <div className="auth-image-panel">
        <img src="/auth-building.jpg" alt="Modern apartment building at dusk" className="auth-building-img" />
        <div className="auth-image-overlay">
          <div className="auth-image-brand">
            <div className="auth-brand-name">Society Maintenance Tracker</div>
            <div className="auth-brand-sub">Your apartment management portal</div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-heading">
            <h1>Create your account</h1>
            <p>Register as a new resident</p>
          </div>

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
                placeholder="e.g. A-101"
                required
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-with-toggle">
                <input
                  id="reg-password"
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <span className="form-hint">Minimum 8 characters</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-with-toggle">
                <input
                  id="reg-confirm"
                  className="form-control"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
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

          <div className="auth-form-footer">
            Already registered?{' '}
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
