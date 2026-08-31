import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

export default function ProtectedRoute({ children, actionName = 'access this feature' }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#EBEBEB',
          color: '#1C1C1C',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: '3px solid rgba(17, 17, 17, 0.15)',
            borderTopColor: '#111111',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 16,
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 700, color: '#555555' }}>
          Verifying session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <div
        style={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: '#EBEBEB',
        }}
      >
        <div
          className="anim-scale-up"
          style={{
            maxWidth: 480,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.9)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(17, 17, 17, 0.08)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: '#DED8ED',
              color: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(222, 216, 237, 0.5)',
            }}
          >
            <Lock size={30} strokeWidth={2.2} />
          </div>

          <span
            style={{
              background: '#111111',
              color: '#DED8ED',
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: 12,
            }}
          >
            Authentication Required
          </span>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: '#111111',
              margin: '0 0 10px',
              letterSpacing: '-0.02em',
            }}
          >
            Please Log In to Continue
          </h2>

          <p
            style={{
              fontSize: 14,
              color: '#666666',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}
          >
            To {actionName}, view your personalized policy vault, compare underwriter plans, or complete renewals, please sign in to your secure account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              to="/login"
              state={{ returnUrl: location.pathname + location.search }}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 14,
                background: '#111111',
                color: '#FFFFFF',
                fontSize: 14.5,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(17, 17, 17, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <LogIn size={18} />
              <span>Log In / Sign In</span>
            </Link>

            <Link
              to="/signup"
              state={{ returnUrl: location.pathname + location.search }}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 14,
                background: 'transparent',
                color: '#1C1C1C',
                border: '1px solid rgba(17, 17, 17, 0.2)',
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={16} />
              <span>Create Free Account</span>
            </Link>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: '1px solid rgba(17, 17, 17, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 12,
              color: '#888888',
            }}
          >
            <ShieldCheck size={14} color="#059669" />
            <span>256-Bit Bank-Grade Encrypted Session</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
