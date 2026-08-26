import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const { login, loginDemo, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/insurance-vault');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickDemo = (role) => {
    loginDemo(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/insurance-vault');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 480, paddingTop: 60, paddingBottom: 60 }}>
      <div className="saas-card" style={{ padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0B1F3A 0%, #1565C0 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              boxShadow: '0 8px 20px rgba(11, 31, 58, 0.15)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 24, color: 'var(--primary-navy)', fontWeight: 800, margin: 0 }}>Sign In to SYNOVA</h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
            Autonomous AI Insurance Aggregator & Policy Vault
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--status-rose-bg)', border: '1px solid var(--status-rose-border)', borderRadius: 10, color: 'var(--status-rose)', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-pill-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: 14 }}
          >
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </button>
        </form>

        <div style={{ margin: '24px 0 18px', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(11, 31, 58, 0.08)' }} />
          <span style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-dim)' }}>OR DEMO ACCESS</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(11, 31, 58, 0.08)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            onClick={() => handleQuickDemo('customer')}
            className="btn-pill-secondary"
            style={{ fontSize: 12.5, padding: '10px 12px' }}
          >
            Demo Customer
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="btn-pill-secondary"
            style={{ fontSize: 12.5, padding: '10px 12px' }}
          >
            Demo Admin
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--blue-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
