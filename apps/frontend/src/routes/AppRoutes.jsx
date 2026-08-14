import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from '../features/dashboard/Dashboard.jsx';

function PlaceholderPage({ title, description, backTo = '/dashboard' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      fontFamily: 'Inter, sans-serif',
      background: 'var(--color-surface-alt, #FAFDFD)',
      color: 'var(--color-text-primary, #101828)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'var(--color-primary-tint, #E4F2F2)',
        color: 'var(--color-primary, #0F6E6E)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        S
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{title}</h1>
      <p style={{ fontSize: '15px', color: 'var(--color-text-muted, #566A6E)', maxWidth: '480px', marginBottom: '24px', lineHeight: '1.5' }}>
        {description}
      </p>
      <Link
        to={backTo}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '9999px',
          background: 'var(--color-primary, #0F6E6E)',
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
          textDecoration: 'none'
        }}
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route
        path="/new-insurance"
        element={
          <PlaceholderPage
            title="Start New Insurance Application"
            description="Euler will guide you through comparing and selecting the best auto insurance policy for your vehicle."
          />
        }
      />
      
      <Route
        path="/renewal"
        element={
          <PlaceholderPage
            title="Policy Renewal"
            description="Renew your ICICI Lombard Comprehensive Policy AUTO-123456 instantly with pre-filled vehicle details."
          />
        }
      />

      <Route
        path="/policies"
        element={
          <PlaceholderPage
            title="Your Insurance Policies"
            description="View all active and past auto insurance policies, coverage schedules, and claim histories."
          />
        }
      />

      <Route
        path="/applications"
        element={
          <PlaceholderPage
            title="Application Tracking"
            description="Track your application SYN-2026-00124 and review generated quotes."
          />
        }
      />

      <Route
        path="/documents"
        element={
          <PlaceholderPage
            title="Policy Documents"
            description="Access and download your Policy Certificates, Tax Invoices, and Premium Receipts."
          />
        }
      />

      <Route
        path="/settings"
        element={
          <PlaceholderPage
            title="Account & Profile Settings"
            description="Manage your contact details, notification preferences, and security settings."
          />
        }
      />

      <Route
        path="/help"
        element={
          <PlaceholderPage
            title="Help & Support"
            description="Get assistance from Euler or contact SYNOVA 24/7 dedicated customer care."
          />
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
