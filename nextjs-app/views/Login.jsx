'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-with-toggle">
                <input
                  id="login-password"
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-form-footer">
            New resident?{' '}
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
