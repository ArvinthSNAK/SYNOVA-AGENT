import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignInPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="page-container" style={{ maxWidth: 450, paddingTop: 80 }}>
      <div className="glass-card" style={{ padding: 36 }}>
        <h2 style={{ fontSize: 26, color: '#F9FAFB', marginBottom: 8, textAlign: 'center' }}>Sign In to SYNOVA</h2>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28, textAlign: 'center' }}>
          Access your insurance aggregation portal & vault
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: 48 }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
          Don't have an account? <Link to="/auth/signup" style={{ color: '#6366F1', fontWeight: 600 }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
