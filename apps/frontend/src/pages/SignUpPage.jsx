import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="page-container" style={{ maxWidth: 450, paddingTop: 80 }}>
      <div className="glass-card" style={{ padding: 36 }}>
        <h2 style={{ fontSize: 26, color: '#F9FAFB', marginBottom: 8, textAlign: 'center' }}>Create Account</h2>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28, textAlign: 'center' }}>
          Join SYNOVA AI Insurance Agent Platform
        </p>

        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              className="input-field"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arvinth Kumar"
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#9CA3AF', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
            Create Account
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
          Already have an account? <Link to="/auth/login" style={{ color: '#6366F1', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
