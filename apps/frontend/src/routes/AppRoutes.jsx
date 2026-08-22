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
import { usersByCompany, recentApplications, overviewStats, adminRenewalsData, adminClaimsData } from '../features/admin/mockData.js';

// User Dashboard & Journeys
import Dashboard from '../features/dashboard/Dashboard.jsx';
import WalletPage from '../features/wallet/components/WalletPage.jsx';
import NewInsurance from '../features/insurance-application/components/NewInsurance.jsx';
import QuoteResults from '../features/insurance-application/components/QuoteResults.jsx';
import RenewalPage from '../features/insurance-renewal/components/RenewalPage.jsx';
import PoliciesPage from '../pages/PoliciesPage.jsx';
import ApplicationsPage from '../pages/ApplicationsPage.jsx';
import UserNavbar from '../components/layout/UserNavbar.jsx';
import '../features/insurance-application/components/QuoteResults.css';

// User Portal Placeholder Page with UserNavbar
function PlaceholderPage({ title, description, backTo = '/dashboard' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-body)',
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
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const totalCustomers = usersByCompany.reduce((s, c) => s + c.value, 0);

  return (
    <AdminLayout title={title} subtitle={subtitle}>

      {/* ── Customers: company-wise horizontal bar chart ──────── */}
      {type === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { label: 'Total Customers', value: totalCustomers.toLocaleString(), color: '#0F6E6E' },
              { label: 'Agency Partners',  value: usersByCompany.length, color: '#2563EB' },
              { label: 'Avg / Agency',     value: Math.round(totalCustomers / usersByCompany.length).toLocaleString(), color: '#D06A4E' },
            ].map((k) => (
              <div key={k.label} style={{
                background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(226,236,236,0.9)', borderRadius: 14,
                padding: '18px 20px',
                boxShadow: '0 4px 16px rgba(15,110,110,0.04)'
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color, letterSpacing: '-0.02em' }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Horizontal bar chart — company-wise customer count */}
          <div style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
            border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
            padding: '22px 24px', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 4 }}>Customer Count by Agency</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 20 }}>Active policyholders distributed across partner agencies</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {usersByCompany.map((c) => {
                const pct = Math.round((c.value / totalCustomers) * 100);
                return (
                  <div key={c.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</span>
                      <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.value.toLocaleString()} customers</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: `${c.color}15`, padding: '1px 7px', borderRadius: 4 }}>{c.growth}</span>
                      </span>
                    </div>
                    <div style={{ height: 10, borderRadius: 6, background: 'var(--color-surface-alt)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        height: '100%', borderRadius: 6,
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${c.color}dd, ${c.color}99)`,
                        transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)'
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 5, fontSize: 11, color: 'var(--color-text-subtle)' }}>
                      <span>Policies: <strong style={{ color: 'var(--color-text-primary)' }}>{c.policies.toLocaleString()}</strong></span>
                      <span>Renewals: <strong style={{ color: 'var(--color-text-primary)' }}>{c.renewals}</strong></span>
                      <span>Claims: <strong style={{ color: 'var(--color-text-primary)' }}>{c.claims}</strong></span>
                      <span style={{ marginLeft: 'auto' }}>{pct}% share</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Policies table ──────────────────────────────────────── */}
      {type === 'applications' && (
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
          overflow: 'hidden', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            Insurance Policies — All Issuances
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead><tr>
                <th>ID</th><th>Applicant</th><th>Type</th><th>Insurer</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {recentApplications.map((row) => (
                  <tr key={row.id} className="admin-table-row">
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{row.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 13 }}>{row.applicant}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>{row.company}</div>
                    </td>
                    <td>{row.type}</td><td>{row.insurer}</td>
                    <td><Badge tone={row.status === 'Approved' ? 'good' : row.status === 'Pending' ? 'warning' : 'critical'}>{row.status}</Badge></td>
                    <td style={{ fontSize: 12 }}>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Renewals table ──────────────────────────────────────── */}
      {type === 'renewals' && (
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
          overflow: 'hidden', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            Upcoming & Overdue Policy Renewals
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead><tr>
                <th>ID</th><th>Customer</th><th>Vehicle</th><th>Carrier</th><th>Premium</th><th>NCB</th><th>Due Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                {adminRenewalsData.map((row) => (
                  <tr key={row.id} className="admin-table-row">
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>{row.id}</td>
                    <td style={{ fontWeight: 600 }}>{row.customer}</td>
                    <td>{row.vehicle}</td><td>{row.provider}</td>
                    <td className="mono" style={{ fontWeight: 700 }}>{formatINR(row.premium)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{row.ncb}</td>
                    <td style={{ fontSize: 12 }}>{row.dueDate}</td>
                    <td>
                      <Badge tone={row.status === 'Overdue' ? 'critical' : row.status === 'Due Soon' ? 'warning' : 'neutral'}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Claims table ─────────────────────────────────────────── */}
      {type === 'claims' && (
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
          overflow: 'hidden', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            Insurance Claims — Live Status
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead><tr>
                <th>Claim ID</th><th>Customer</th><th>Vehicle</th><th>Claim Type</th><th>Amount</th><th>Carrier</th><th>Filed</th><th>Status</th>
              </tr></thead>
              <tbody>
                {adminClaimsData.map((row) => {
                  const tone = row.status === 'Settled' || row.status === 'Approved' ? 'good'
                    : row.status === 'Under Review' ? 'warning' : 'neutral';
                  return (
                    <tr key={row.id} className="admin-table-row">
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>{row.id}</td>
                      <td style={{ fontWeight: 600 }}>{row.customer}</td>
                      <td>{row.vehicle}</td>
                      <td>{row.type}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{formatINR(row.amount)}</td>
                      <td>{row.provider}</td>
                      <td style={{ fontSize: 12 }}>{row.filed}</td>
                      <td><Badge tone={tone}>{row.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Agencies ─────────────────────────────────────────────── */}
      {type === 'companies' && (
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
          overflow: 'hidden', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            Connected Agencies & Brokerages
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead><tr><th>Agency Name</th><th>Customers</th><th>Policies</th><th>Monthly GWP</th><th>Growth</th><th>Status</th></tr></thead>
              <tbody>
                {usersByCompany.map((c, i) => (
                  <tr key={i} className="admin-table-row">
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.value.toLocaleString()}</td>
                    <td>{c.policies.toLocaleString()}</td>
                    <td className="mono" style={{ fontWeight: 700 }}>₹{(c.value * 1.8 / 100).toFixed(1)}L</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{c.growth}</td>
                    <td><Badge tone="good">Verified</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Carriers ─────────────────────────────────────────────── */}
      {type === 'insurers' && (
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
          overflow: 'hidden', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>
            Integrated Insurance Carriers
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ margin: 0 }}>
              <thead><tr><th>Carrier</th><th>Integration Mode</th><th>Quote SLA</th><th>Settlement Rate</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  { name: 'ICICI Lombard', mode: 'API + Playwright', sla: '15s', rate: '99.2%' },
                  { name: 'TATA AIG',      mode: 'Direct API',       sla: '12s', rate: '98.1%' },
                  { name: 'ACKO',          mode: 'Direct API',       sla: '8s',  rate: '97.5%' },
                  { name: 'HDFC ERGO',     mode: 'Playwright Worker', sla: '22s', rate: '98.8%' },
                  { name: 'Bajaj Allianz', mode: 'API Connector',    sla: '18s', rate: '97.9%' },
                ].map((ins, i) => (
                  <tr key={i} className="admin-table-row">
                    <td style={{ fontWeight: 600 }}>{ins.name}</td>
                    <td>{ins.mode}</td>
                    <td className="mono">{ins.sla}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{ins.rate}</td>
                    <td><Badge tone="good">Operational</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {type === 'settings' && (
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)',
          border: '1px solid rgba(226,236,236,0.9)', borderRadius: 16,
          padding: '24px', boxShadow: '0 6px 24px rgba(15,110,110,0.06)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)' }}>Platform Configuration</h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>Configure carrier quoting rules, AI assistant models, and automated OCR pipelines.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'AI Extraction Engine', value: 'Euler Copilot (Vision + LLM)' },
              { label: 'Quoting Automation', value: 'Playwright Multi-Worker Pool' },
              { label: 'Data Region', value: 'ap-south-1 (Mumbai)' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '14px 18px', background: 'var(--color-surface-alt)',
                borderRadius: 10, border: '1px solid var(--color-border)', flex: 1, minWidth: 200
              }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>{s.value}</div>
              </div>
            ))}
          </div>
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
      <Route path="/wallet" element={<WalletPage />} />

      {/* Journey 2: New Auto Insurance */}
      <Route path="/new-insurance" element={<NewInsurance />} />
      <Route path="/new-insurance/quotes" element={<QuoteResults />} />

      {/* Journey 3: Auto Insurance Renewal */}
      <Route path="/renewal" element={<RenewalPage />} />
      <Route path="/renewal/quotes" element={<RenewalPage />} />

      {/* User Portal Side Navigation Links */}
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
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
      {/* Core nav links: Customers, Policies, Renewals, Claims */}
      <Route path="/admin/users" element={<AdminSubPage title="Customers" subtitle="Company-wise customer distribution across all agency partners" type="users" />} />
      <Route path="/admin/applications" element={<AdminSubPage title="Policies" subtitle="All issued and pending insurance policies" type="applications" />} />
      <Route path="/admin/renewals" element={<AdminSubPage title="Renewals" subtitle="Upcoming and overdue policy renewals" type="renewals" />} />
      <Route path="/admin/claims" element={<AdminSubPage title="Claims" subtitle="Active and settled insurance claims" type="claims" />} />
      {/* Secondary pages */}
      <Route path="/admin/companies" element={<AdminSubPage title="Agencies" subtitle="Connected partner agencies and brokerages" type="companies" />} />
      <Route path="/admin/insurers" element={<AdminSubPage title="Carriers" subtitle="Configured insurance carriers and automated quoting status" type="insurers" />} />
      <Route path="/admin/settings" element={<AdminSubPage title="Admin Settings" subtitle="Platform preferences and automation settings" type="settings" />} />

      {/* Catch-all fallback to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
