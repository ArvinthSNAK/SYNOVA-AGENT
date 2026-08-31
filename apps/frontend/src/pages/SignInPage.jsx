import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validators';
import { Eye, EyeOff } from 'lucide-react';
import OrbitingCoverageBadge from '../components/common/OrbitingCoverageBadge';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loginDemo, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.error);
      return;
    }

    if (!password || password.trim().length === 0) {
      setError('Please enter your password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/insurance-vault');
      }
    } else {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
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
    <div className="page-container" style={{ maxWidth: 980, paddingTop: 50, paddingBottom: 60 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-hover)',
          border: '1px solid rgba(28, 28, 28, 0.06)',
        }}
      >
        {/* Left: Brand Panel */}
        <div
          style={{
            background: 'linear-gradient(160deg, #5B5171 0%, #3D3550 100%)',
            padding: '48px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 28,
          }}
        >
          <OrbitingCoverageBadge size={280} showCenter={false} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.06em', color: '#FFFFFF' }}>SYNOVA</div>
            <p style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.6)', maxWidth: 300 }}>
              Welcome back — pick up right where you left off with every policy in one place.
            </p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div style={{ background: '#FFFFFF', padding: '48px 44px' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, color: 'var(--primary-navy)', fontWeight: 800, margin: 0 }}>Sign in to your account</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
              Autonomous AI insurance aggregator &amp; policy vault.
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, color: '#E11D48', fontSize: 13, marginBottom: 18, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
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

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                style={{ paddingRight: 40 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9A9A9A',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            <div style={{ flex: 1, height: 1, background: 'rgba(28, 28, 28, 0.08)' }} />
            <span style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-dim)' }}>OR DEMO ACCESS</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(28, 28, 28, 0.08)' }} />
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
    </div>
  );
}
