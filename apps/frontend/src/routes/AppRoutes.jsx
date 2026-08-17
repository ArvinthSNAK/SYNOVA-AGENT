import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Landing and Auth pages
import LandingPage from '../pages/LandingPage.jsx';
import SignInPage from '../pages/SignInPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { usersByCompany, recentApplications, overviewStats } from '../features/admin/mockData.js';

// User Dashboard & Journeys
import Dashboard from '../features/dashboard/Dashboard.jsx';
import NewInsurance from '../features/insurance-application/components/NewInsurance.jsx';
import QuoteResults from '../features/insurance-application/components/QuoteResults.jsx';
import RenewalPage from '../features/insurance-renewal/components/RenewalPage.jsx';
import '../features/insurance-application/components/QuoteResults.css';

// User Portal Placeholder Page
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

// Admin Sub-Page Helper
function AdminSubPage({ title, subtitle, type }) {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      {type === 'users' && (
        <Card className="dash-table-card" padded={false}>
          <div className="dash-table-head">
            <h3>Registered Agency Users</h3>
            <span style={{ fontSize: 13, color: "var(--color-text-subtle)" }}>{overviewStats.totalUsers} total agents</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Agency / Company</th>
                  <th>Role</th>
                  <th>Applications</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersByCompany.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>Agent #{i + 1} ({c.name.split(' ')[0]})</td>
                    <td>{c.name}</td>
                    <td>Licensed Broker</td>
                    <td>{c.value} quotes</td>
                    <td><Badge tone="good">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {type === 'companies' && (
        <Card className="dash-table-card" padded={false}>
          <div className="dash-table-head">
            <h3>Connected Agencies & Brokerages</h3>
            <span style={{ fontSize: 13, color: "var(--color-text-subtle)" }}>{overviewStats.totalCompanies} active companies</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>License Tier</th>
                  <th>Active Agents</th>
                  <th>Monthly Volume</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersByCompany.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>Enterprise Agency</td>
                    <td>{c.value}</td>
                    <td>₹{(c.value * 1.8).toFixed(1)}L</td>
                    <td><Badge tone="good">Verified</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {type === 'applications' && (
        <Card className="dash-table-card" padded={false}>
          <div className="dash-table-head">
            <h3>All Customer Insurance Applications</h3>
            <span style={{ fontSize: 13, color: "var(--color-text-subtle)" }}>{overviewStats.totalApplications} submissions tracked</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Type</th>
                  <th>Insurer</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((row) => (
                  <tr key={row.id}>
                    <td className="dash-table-id">{row.id}</td>
                    <td>
                      <div className="dash-table-applicant">{row.applicant}</div>
                      <div className="dash-table-company">{row.company}</div>
                    </td>
                    <td>{row.type}</td>
                    <td>{row.insurer}</td>
                    <td>
                      <Badge tone={row.status === 'Approved' ? 'good' : row.status === 'Pending' ? 'warning' : 'critical'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {type === 'insurers' && (
        <Card className="dash-table-card" padded={false}>
          <div className="dash-table-head">
            <h3>Integrated Insurance Carriers</h3>
            <span style={{ fontSize: 13, color: "var(--color-text-subtle)" }}>Live API & Playwright Automation</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Integration Mode</th>
                  <th>Quote SLA</th>
                  <th>Settlement Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'ICICI Lombard', mode: 'API + Playwright', sla: '15s', rate: '99.2%' },
                  { name: 'TATA AIG', mode: 'Direct API', sla: '12s', rate: '98.1%' },
                  { name: 'ACKO', mode: 'Direct API', sla: '8s', rate: '97.5%' },
                  { name: 'HDFC ERGO', mode: 'Playwright Worker', sla: '22s', rate: '98.8%' },
                  { name: 'Bajaj Allianz', mode: 'API Connector', sla: '18s', rate: '97.9%' },
                ].map((ins, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{ins.name}</td>
                    <td>{ins.mode}</td>
                    <td>{ins.sla}</td>
                    <td>{ins.rate}</td>
                    <td><Badge tone="good">Operational</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {type === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Platform Configuration</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Configure carrier quoting rules, AI assistant models, and automated OCR pipelines.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ padding: '12px 16px', background: 'var(--color-surface-alt)', borderRadius: 8, border: '1px solid var(--color-border)', flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>AI Extraction Engine</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', marginTop: 4 }}>Euler Copilot (Vision + LLM)</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--color-surface-alt)', borderRadius: 8, border: '1px solid var(--color-border)', flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Quoting Automation</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', marginTop: 4 }}>Playwright Multi-Worker Pool</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public / Marketing ─────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* ─── Auth ───────────────────────────────────────────── */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/login" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/register" element={<SignUpPage />} />

      {/* ─── User Portal (Journey 1, 2, 3) ──────────────────── */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Journey 2: New Auto Insurance */}
      <Route path="/new-insurance" element={<NewInsurance />} />
      <Route path="/new-insurance/quotes" element={<QuoteResults />} />

      {/* Journey 3: Auto Insurance Renewal */}
      <Route path="/renewal" element={<RenewalPage />} />
      <Route path="/renewal/quotes" element={<RenewalPage />} />

      {/* User Portal Side Navigation Links */}
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

      {/* ─── Admin Portal ───────────────────────────────────── */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminSubPage title="Users" subtitle="Platform users and agency agents" type="users" />} />
      <Route path="/admin/companies" element={<AdminSubPage title="Companies" subtitle="Connected partner agencies and brokerages" type="companies" />} />
      <Route path="/admin/applications" element={<AdminSubPage title="Applications" subtitle="Customer insurance applications overview" type="applications" />} />
      <Route path="/admin/insurers" element={<AdminSubPage title="Insurers" subtitle="Configured insurance carriers and automated quoting status" type="insurers" />} />
      <Route path="/admin/settings" element={<AdminSubPage title="Admin Settings" subtitle="Platform preferences and automation settings" type="settings" />} />

      {/* Catch-all fallback to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
