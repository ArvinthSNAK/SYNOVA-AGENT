import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateEmail } from '../utils/validators';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import OrbitingCoverageBadge from '../components/common/OrbitingCoverageBadge';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const pwdValidation = validatePassword(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setError(emailVal.error);
      return;
    }

    // Password validation
    if (!pwdValidation.isValid) {
      setError('Please satisfy all password security requirements below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    const res = await register(email, password, fullName);
    if (res.success) {
      navigate('/insurance-vault');
    } else {
      setError(res.error || 'Registration failed');
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
          <OrbitingCoverageBadge size={280} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.06em', color: '#FFFFFF' }}>SYNOVA</div>
            <p style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.6)', maxWidth: 300 }}>
              Start aggregating, comparing, and vaulting every policy you own — in one intelligent place.
            </p>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div style={{ background: '#FFFFFF', padding: '48px 44px' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 28, color: 'var(--primary-navy)', fontWeight: 800, margin: 0 }}>Create your account</h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
              Start aggregating, comparing, and vaulting your policies.
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 10, color: '#E11D48', fontSize: 13, marginBottom: 18, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 14 }}>
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

          <div style={{ marginBottom: 14 }}>
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

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Create Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars with upper, lower, digit, symbol"
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

            {/* Live Password Strength Meter */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11.5, color: '#6B6B6B' }}>Password Strength:</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: pwdValidation.strengthColor }}>
                    {pwdValidation.strength}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, height: 4 }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        flex: 1,
                        borderRadius: 2,
                        background: lvl <= pwdValidation.score ? pwdValidation.strengthColor : '#E2E8F0',
                        transition: 'background 0.2s ease',
                      }}
                    />
                  ))}
                </div>

                {/* Requirements Checklist */}
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11.5 }}>
                  <div style={{ color: pwdValidation.requirements.minLength ? '#059669' : '#6B6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pwdValidation.requirements.minLength ? <Check size={13} /> : <X size={13} color="#9A9A9A" />} 8+ Characters
                  </div>
                  <div style={{ color: pwdValidation.requirements.hasUpper ? '#059669' : '#6B6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pwdValidation.requirements.hasUpper ? <Check size={13} /> : <X size={13} color="#9A9A9A" />} Uppercase (A-Z)
                  </div>
                  <div style={{ color: pwdValidation.requirements.hasLower ? '#059669' : '#6B6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pwdValidation.requirements.hasLower ? <Check size={13} /> : <X size={13} color="#9A9A9A" />} Lowercase (a-z)
                  </div>
                  <div style={{ color: pwdValidation.requirements.hasNumber ? '#059669' : '#6B6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pwdValidation.requirements.hasNumber ? <Check size={13} /> : <X size={13} color="#9A9A9A" />} Number (0-9)
                  </div>
                  <div style={{ gridColumn: 'span 2', color: pwdValidation.requirements.hasSpecial ? '#059669' : '#6B6B6B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pwdValidation.requirements.hasSpecial ? <Check size={13} /> : <X size={13} color="#9A9A9A" />} Special Symbol (!@#$%^&*)
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-body)', marginBottom: 6, fontWeight: 600 }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{ paddingRight: 40 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div style={{ fontSize: 11.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: passwordsMatch ? '#059669' : '#E11D48' }}>
                {passwordsMatch ? <Check size={13} /> : <X size={13} />}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}
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

          <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/signin" style={{ color: 'var(--blue-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
