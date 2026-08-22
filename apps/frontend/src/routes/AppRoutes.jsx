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
import LandingPage from '../pages/LandingPage.jsx';
import SignInPage from '../pages/SignInPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';

// User Portal Placeholder Page
function PlaceholderPage({ title, description, backTo = '/dashboard' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      background: 'radial-gradient(circle at 10% 20%, rgba(228, 242, 242, 0.7) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(251, 237, 232, 0.6) 0%, transparent 45%), var(--color-surface-alt, #FAFDFD)',
      color: 'var(--color-text-primary, #101828)',
    }}>
      <UserNavbar />
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px 80px',
        textAlign: 'center'
      }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226, 236, 236, 0.95)',
        borderRadius: '24px',
        padding: '44px 36px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 20px 45px -10px rgba(15, 110, 110, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-deep))',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          fontWeight: 'bold',
          marginBottom: '20px',
          boxShadow: '0 8px 20px rgba(15, 110, 110, 0.25)'
        }}>
          S
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em' }}>{title}</h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted, #566A6E)', maxWidth: '440px', marginBottom: '28px', lineHeight: '1.6' }}>
          {description}
        </p>
        <Link
          to={backTo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '9999px',
            background: 'var(--color-primary, #0F6E6E)',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(15, 110, 110, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          &larr; Back to Dashboard
        </Link>
      </div>
      </div>
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

