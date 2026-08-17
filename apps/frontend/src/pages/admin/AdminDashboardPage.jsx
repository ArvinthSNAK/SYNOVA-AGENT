import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import {
  UsersIcon,
  BuildingIcon,
  FileTextIcon,
  CheckCircleIcon,
  ShieldIcon,
  SearchIcon,
} from '../../components/common/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  adminKPIs,
  policyGrowthData,
  renewalTrendsData,
  providerDistributionData,
  providerQuoteAnalytics,
  adminActivityFeed,
  adminPolicyRecords,
} from '../../features/admin/mockData';
import { RefreshCcw, TrendingUp, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import './AdminDashboardPage.css';

const STATUS_TONE = {
  Active: 'good',
  'Expiring Soon': 'warning',
  Pending: 'warning',
  Rejected: 'critical',
};

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activePage, setActivePage] = useState(1);

  // Filtered policy rows
  const filteredPolicies = useMemo(() => {
    return adminPolicyRecords.filter((p) => {
      const matchesSearch =
        p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <AdminLayout
      title="Good morning, Admin"
      subtitle="Here’s what’s happening across Synova and connected carrier networks today."
    >
      {/* ─── 1. KPI Summary Cards ────────────────────────────── */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card hover-lift">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Total Customers</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--teal">
              <UsersIcon width={18} height={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.totalCustomers.toLocaleString()}</div>
          <div className="admin-kpi-delta up">
            <ArrowUpRight size={13} /> +12.4% vs last month
          </div>
        </div>

        <div className="admin-kpi-card hover-lift">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Active Policies</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.activePolicies.toLocaleString()}</div>
          <div className="admin-kpi-delta up">
            <ArrowUpRight size={13} /> +8.1% vs last month
          </div>
        </div>

        <div className="admin-kpi-card hover-lift">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Renewals Due</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--amber">
              <RefreshCcw size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.renewalsDue.toLocaleString()}</div>
          <div className="admin-kpi-delta" style={{ color: 'var(--color-warning)' }}>
            43 due within 30 days
          </div>
        </div>

        <div className="admin-kpi-card hover-lift">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Quotes Generated</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--blue">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.quotesGenerated.toLocaleString()}</div>
          <div className="admin-kpi-delta up">
            <ArrowUpRight size={13} /> +18.6% conversion
          </div>
        </div>

        <div className="admin-kpi-card hover-lift">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Active Claims</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--coral">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.claimsActive.toLocaleString()}</div>
          <div className="admin-kpi-delta" style={{ color: 'var(--color-text-subtle)' }}>
            99.2% settlement SLA
          </div>
        </div>
      </div>

      {/* ─── 2. Interactive Charts Grid ──────────────────────── */}
      <div className="admin-charts-row">
        {/* Chart 1: Policy Growth Line Chart */}
        <Card className="admin-chart-card">
          <div className="admin-card-head">
            <div>
              <h3 className="admin-card-title">Policy & Quote Growth</h3>
              <span className="admin-card-sub">Monthly issuance across all connected insurers</span>
            </div>
            <span className="admin-mock-badge">Live Trend</span>
          </div>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={policyGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#7A8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7A8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="policies"
                  name="Bound Policies"
                  stroke="#0F6E6E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0F6E6E' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="quotes"
                  name="Quotes Requested"
                  stroke="#D06A4E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#D06A4E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Provider Distribution Donut Chart */}
        <Card className="admin-chart-card">
          <div className="admin-card-head">
            <div>
              <h3 className="admin-card-title">Carrier Distribution</h3>
              <span className="admin-card-sub">Active policy volume share</span>
            </div>
            <span className="admin-mock-badge">Demo Data</span>
          </div>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={providerDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {providerDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} policies`}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ─── 3. Quote Analytics & Recent Activity ────────────── */}
      <div className="admin-middle-row">
        {/* Quote Analytics by Carrier */}
        <Card className="admin-qa-card">
          <div className="admin-card-head">
            <div>
              <h3 className="admin-card-title">Carrier Quoting Performance</h3>
              <span className="admin-card-sub">Real-time automation metrics & conversion</span>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Quotes Generated</th>
                  <th>Avg. Premium</th>
                  <th>Conversion</th>
                  <th>Response SLA</th>
                </tr>
              </thead>
              <tbody>
                {providerQuoteAnalytics.map((row) => (
                  <tr key={row.provider}>
                    <td style={{ fontWeight: 600 }}>{row.provider}</td>
                    <td className="mono">{row.quotes.toLocaleString()}</td>
                    <td className="mono">{formatINR(row.avgPremium)}</td>
                    <td>
                      <span className="admin-conversion-pill">{row.conversion}%</span>
                    </td>
                    <td>
                      <Badge tone="good">{row.sla}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="admin-activity-card">
          <div className="admin-card-head">
            <div>
              <h3 className="admin-card-title">Recent Activity</h3>
              <span className="admin-card-sub">Platform-wide real-time events</span>
            </div>
          </div>
          <div className="admin-activity-list">
            {adminActivityFeed.map((act) => (
              <div key={act.id} className="admin-activity-item">
                <div className="admin-activity-dot" />
                <div className="admin-activity-body">
                  <p className="admin-activity-text">{act.text}</p>
                  <span className="admin-activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── 4. Full Admin Policy Records Table ──────────────── */}
      <Card className="admin-main-table-card" padded={false}>
        <div className="admin-table-header-controls">
          <div>
            <h3 className="admin-card-title">Policy Registry</h3>
            <span className="admin-card-sub">Manage customer policy records across all partners</span>
          </div>

          {/* Search + Filter */}
          <div className="admin-table-actions">
            <div className="admin-table-search">
              <SearchIcon width={15} height={15} />
              <input
                type="search"
                placeholder="Search policy, vehicle, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-table-filters">
              {['All', 'Active', 'Expiring Soon', 'Pending'].map((st) => (
                <button
                  key={st}
                  className={`admin-filter-pill${statusFilter === st ? ' active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Provider</th>
                <th>Premium</th>
                <th>Status</th>
                <th>Renewal Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((p) => (
                <tr key={p.id} className="admin-table-row-hover">
                  <td className="mono" style={{ fontSize: 12, color: 'var(--color-primary)' }}>
                    {p.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.customer}</td>
                  <td>{p.vehicle}</td>
                  <td>{p.provider}</td>
                  <td className="mono">{formatINR(p.premium)}</td>
                  <td>
                    <Badge tone={STATUS_TONE[p.status] || 'neutral'}>{p.status}</Badge>
                  </td>
                  <td>{p.renewalDate}</td>
                  <td>
                    <button
                      className="admin-action-btn"
                      onClick={() => alert(`Reviewing Policy ${p.id}`)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="admin-pagination-bar">
          <span style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>
            Showing {filteredPolicies.length} of {adminPolicyRecords.length} records
          </span>
          <div className="admin-pagination-btns">
            <button className="admin-page-btn" disabled={activePage === 1}>Previous</button>
            <button className="admin-page-btn active">1</button>
            <button className="admin-page-btn" disabled>Next</button>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
