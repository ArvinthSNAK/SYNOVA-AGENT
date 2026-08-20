import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '16px 32px'
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            width: 38,
            height: 38,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#fff',
            fontSize: 18,
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>S</div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
              SYNOVA <span style={{ color: '#8B5CF6' }}>AGENT</span>
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              AI Insurance Aggregator
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" style={{
            color: isActive('/') ? '#6366F1' : '#9CA3AF',
            fontWeight: isActive('/') ? 600 : 400,
            fontSize: 14,
            transition: 'color 0.2s'
          }}>
            Insurance Hub
          </Link>
          <Link to="/vault" style={{
            color: isActive('/vault') ? '#6366F1' : '#9CA3AF',
            fontWeight: isActive('/vault') ? 600 : 400,
            fontSize: 14,
            transition: 'color 0.2s'
          }}>
            Customer Vault
          </Link>
          <Link to="/admin" style={{
            color: isActive('/admin') ? '#6366F1' : '#9CA3AF',
            fontWeight: isActive('/admin') ? 600 : 400,
            fontSize: 14,
            transition: 'color 0.2s'
          }}>
            Insurer Admin & Alerts
          </Link>
        </div>

        {/* User Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB' }}>Arvinth Kumar</div>
            <div style={{ fontSize: 11, color: '#34D399' }}>Verified Policyholder</div>
          </div>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#6366F1',
            fontSize: 14
          }}>AK</div>
        </div>
      </div>
    </nav>
  );
}
