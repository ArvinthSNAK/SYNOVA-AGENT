import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(email, password, fullName);
    if (res.success) {
      navigate('/insurance-vault');
    } else {
      setError(res.error || 'Registration failed');
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
          <h2 style={{ fontSize: 24, color: 'var(--primary-navy)', fontWeight: 800, margin: 0 }}>Create SYNOVA Account</h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
            Start aggregating, comparing, and vaulting your policies
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--status-rose-bg)', border: '1px solid var(--status-rose-border)', borderRadius: 10, color: 'var(--status-rose)', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Create Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-pill-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: 14 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up & Continue'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: 'var(--blue-primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
