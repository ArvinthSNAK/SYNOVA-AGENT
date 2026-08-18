import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/common/Badge';
import { PieChart, PieSlice, PieCenter } from '../../components/common/PieChart';
import { RingChart, Ring, RingCenter } from '../../components/common/RingChart';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  adminKPIs,
  policyGrowthData,
  adminPolicyRecords,
} from '../../features/admin/mockData';
import {
  RefreshCcw,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  Zap,
  Eye,
  Check,
} from 'lucide-react';
import './AdminDashboardPage.css';

// BkLit period datasets for Area Chart
const chartDataByPeriod = {
  '7D': [
    { month: 'Mon', policies: 140, quotes: 320, gwp: 28.5 },
    { month: 'Tue', policies: 165, quotes: 380, gwp: 34.2 },
    { month: 'Wed', policies: 190, quotes: 440, gwp: 41.0 },
    { month: 'Thu', policies: 210, quotes: 490, gwp: 46.8 },
    { month: 'Fri', policies: 245, quotes: 530, gwp: 52.4 },
    { month: 'Sat', policies: 180, quotes: 390, gwp: 38.0 },
    { month: 'Sun', policies: 160, quotes: 340, gwp: 32.6 },
  ],
  '30D': policyGrowthData,
  '90D': [
    { month: 'Jun', policies: 840, quotes: 1800, gwp: 180 },
    { month: 'Jul', policies: 1120, quotes: 2450, gwp: 245 },
    { month: 'Aug', policies: 1480, quotes: 3200, gwp: 320 },
  ],
  '1Y': [
    { month: 'Q1', policies: 2400, quotes: 5800, gwp: 520 },
    { month: 'Q2', policies: 3600, quotes: 8400, gwp: 790 },
    { month: 'Q3', policies: 4900, quotes: 11200, gwp: 1080 },
    { month: 'Q4 (Est)', policies: 6200, quotes: 14500, gwp: 1350 },
  ],
};

// Carrier Telemetry & Conversion SLA Pie Dataset
const pieData = [
  { name: 'ICICI Lombard', value: 1420, color: '#0F6E6E', conversion: '32%', sla: '14s', share: '25.8%' },
  { name: 'TATA AIG', value: 1120, color: '#D06A4E', conversion: '28%', sla: '12s', share: '20.4%' },
  { name: 'ACKO', value: 1320, color: '#059669', conversion: '30%', sla: '8s', share: '24.0%' },
  { name: 'HDFC ERGO', value: 961, color: '#2563EB', conversion: '24%', sla: '21s', share: '17.5%' },
  { name: 'Synova Direct', value: 680, color: '#F59E0B', conversion: '35%', sla: '5s', share: '12.3%' },
];

// Multi-Channel Acquisition & Retention Ring Dataset
const ringData = [
  { name: 'Direct Web Portal', value: 84, color: '#0F6E6E', sub: '3,420 Active Users' },
  { name: 'Broker Partner APIs', value: 68, color: '#2563EB', sub: '1,401 Integrations' },
  { name: 'Agency Network', value: 52, color: '#D06A4E', sub: '8 Agencies' },
  { name: 'Renewal Retention', value: 94, color: '#059669', sub: '94.2% Preserved NCB' },
];

const STATUS_TONE = {
  Active: 'good',
  'Expiring Soon': 'warning',
  Pending: 'warning',
  Rejected: 'critical',
};

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

// BkLit Custom Glass Tooltip
function BkLitCustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bklit-glass-tooltip">
        <div className="bklit-tooltip-label">{label}</div>
        {payload.map((item, index) => (
          <div key={index} className="bklit-tooltip-row">
            <span className="bklit-tooltip-dot" style={{ background: item.color }} />
            <span className="bklit-tooltip-name">{item.name}:</span>
            <span className="bklit-tooltip-val">
              {item.name.includes('GWP') ? `₹${item.value}L` : item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [chartPeriod, setChartPeriod] = useState('30D');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(false);

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

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  return (
    <AdminLayout
      title="Operations & Carrier Intelligence Hub"
      subtitle="Real-time multi-carrier quoting automation, policy binding analytics, and API SLA telemetry."
    >
      {/* ─── 1. Modern FinTech Bento KPI Row ────────────────── */}
      <div className="admin-kpi-grid">
        {/* Total Customers */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="admin-kpi-card glass-panel"
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Active Customers</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--teal">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.totalCustomers.toLocaleString()}</div>
          <div className="admin-kpi-delta up">
            <ArrowUpRight size={13} /> +12.4% MoM growth
          </div>
        </motion.div>

        {/* Bound Policies GWP */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="admin-kpi-card glass-panel admin-kpi-card--highlight"
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Active Bound Policies</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.activePolicies.toLocaleString()}</div>
          <div className="admin-kpi-delta up">
            <ArrowUpRight size={13} /> ₹4.82 Cr Annualized GWP
          </div>
        </motion.div>

        {/* Multi-Carrier Quotes */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="admin-kpi-card glass-panel"
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Quotes Dispatched</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--blue">
              <Zap size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">{adminKPIs.quotesGenerated.toLocaleString()}</div>
          <div className="admin-kpi-delta up">
            <ArrowUpRight size={13} /> 12.8s Quoting SLA
          </div>
        </motion.div>

        {/* Renewals Rate */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="admin-kpi-card glass-panel"
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">NCB Preserved Renewals</span>
            <div className="admin-kpi-icon-wrap admin-kpi-icon-wrap--amber">
              <RefreshCcw size={18} />
            </div>
          </div>
          <div className="admin-kpi-val mono">94.2%</div>
          <div className="admin-kpi-delta" style={{ color: 'var(--color-warning)' }}>
            43 renewals due this month
          </div>
        </motion.div>
      </div>

      {/* ─── 2. Carrier Telemetry & Conversion SLA (BkLit PieChart) ── */}
      <div className="admin-chart-card glass-panel">
        <div className="admin-card-head">
          <div>
            <h3 className="admin-card-title">Carrier Telemetry & Conversion SLA</h3>
            <span className="admin-card-sub">Multi-carrier quoting volume share, conversion efficiency, and automated API SLA</span>
          </div>
          <span className="bklit-badge-pill">Live Telemetry</span>
        </div>

        <div className="bklit-carrier-telemetry-layout">
          {/* PieChart Component using exact requested JSX code */}
          <div className="bklit-carrier-pie-box">
            <PieChart
              data={pieData}
              size={100}
              innerRadius={51}
              padAngle={0}
              cornerRadius={0}
              hoverOffset={10}
              startAngle={-90 * Math.PI / 180}
              endAngle={270 * Math.PI / 180}
              enterTransition={{ type: "tween", duration: 1.1, ease: [0.85, 0, 0.15, 1] }}
              enterStaggerScale={1.00}
            >
              <PieSlice index={0} hoverEffect="translate" />
              <PieSlice index={1} hoverEffect="translate" />
              <PieSlice index={2} hoverEffect="translate" />
              <PieSlice index={3} hoverEffect="translate" />
              <PieSlice index={4} hoverEffect="translate" />
              <PieCenter defaultLabel="Total" />
            </PieChart>
          </div>

          {/* Carrier Telemetry Metrics Table */}
          <div className="bklit-carrier-metrics-grid">
            {pieData.map((c) => (
              <div key={c.name} className="bklit-carrier-metric-card">
                <div className="bklit-carrier-metric-top">
                  <span className="bklit-carrier-dot" style={{ background: c.color }} />
                  <span className="bklit-carrier-name">{c.name}</span>
                  <span className="bklit-carrier-share">{c.share}</span>
                </div>
                <div className="bklit-carrier-metric-vals">
                  <div className="bklit-carrier-stat">
                    <span className="bklit-carrier-stat-label">Quotes</span>
                    <span className="bklit-carrier-stat-num mono">{c.value.toLocaleString()}</span>
                  </div>
                  <div className="bklit-carrier-stat">
                    <span className="bklit-carrier-stat-label">Conversion</span>
                    <span className="bklit-carrier-stat-num mono" style={{ color: 'var(--color-primary)' }}>{c.conversion}</span>
                  </div>
                  <div className="bklit-carrier-stat">
                    <span className="bklit-carrier-stat-label">Avg SLA</span>
                    <span className="bklit-carrier-stat-num mono" style={{ color: 'var(--color-success)' }}>{c.sla}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 3. Channel Acquisition & Retention Ring Chart ────── */}
      <div className="admin-chart-card glass-panel">
        <div className="admin-card-head">
          <div>
            <h3 className="admin-card-title">Channel Acquisition & Retention Telemetry</h3>
            <span className="admin-card-sub">Concentric multi-ring channel efficiency and customer retention index</span>
          </div>
          <span className="bklit-badge-pill">Ring Telemetry</span>
        </div>

        {/* RingChart component using exact requested JSX syntax */}
        <RingChart
          data={ringData}
          size={100}
          animationDuration={1100}
          animationEasing="cubic-bezier(0.85, 0, 0.15, 1)"
          strokeWidth={12}
          ringGap={6}
          baseInnerRadius={60}
        >
          {ringData.map((_, i) => <Ring index={i} key={i} />)}
          <RingCenter defaultLabel="Channels" />
        </RingChart>
      </div>

      {/* ─── 4. BkLit Policy Issuance & Quoting Volume Area Chart ── */}
      <div className="admin-chart-card glass-panel">
        <div className="admin-card-head">
          <div>
            <h3 className="admin-card-title">Policy Issuance & Quoting Volume</h3>
            <span className="admin-card-sub">Real-time throughput across all 5 integrated carriers</span>
          </div>
          {/* Period Selector */}
          <div className="bklit-period-pills">
            {['7D', '30D', '90D', '1Y'].map((p) => (
              <button
                key={p}
                className={`bklit-period-btn ${chartPeriod === p ? 'bklit-period-btn--active' : ''}`}
                onClick={() => setChartPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartDataByPeriod[chartPeriod]} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bklitPrimaryGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F6E6E" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0F6E6E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="bklitAccentGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D06A4E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D06A4E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 236, 236, 0.6)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#7A8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#7A8C8C', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<BkLitCustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Area
                type="monotone"
                dataKey="policies"
                name="Bound Policies"
                stroke="#0F6E6E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#bklitPrimaryGlow)"
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="quotes"
                name="Quotes Requested"
                stroke="#D06A4E"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#bklitAccentGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── 5. Interactive Live Policy Operations Table ──────── */}
      <div className="admin-table-card glass-panel">
        <div className="admin-table-controls-bar">
          <div className="admin-table-tabs">
            {['All', 'Active', 'Expiring Soon', 'Pending'].map((status) => (
              <button
                key={status}
                className={`admin-table-tab ${statusFilter === status ? 'admin-table-tab--active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="admin-table-actions">
            <div className="admin-table-search-box">
              <Search size={14} className="admin-table-search-icon" />
              <input
                type="text"
                placeholder="Filter policies by ID, customer, vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="admin-export-btn"
              onClick={handleExport}
            >
              {exportSuccess ? (
                <>
                  <Check size={14} style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-success)' }}>Exported</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Customer & Contact</th>
                <th>Vehicle & Registration</th>
                <th>Insurer Carrier</th>
                <th>Annual Premium</th>
                <th>NCB</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((p) => (
                <tr key={p.id} className="admin-table-row">
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {p.id}
                  </td>
                  <td>
                    <div className="admin-customer-name">{p.customer}</div>
                    <div className="admin-customer-sub">{p.email || 'customer@synova.ai'}</div>
                  </td>
                  <td>
                    <div className="admin-vehicle-name">{p.vehicle}</div>
                    <div className="admin-vehicle-reg mono">{p.registration || 'KA-01-XX-0000'}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.provider}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {formatINR(p.premium)}
                  </td>
                  <td className="mono">{p.ncb || '20%'}</td>
                  <td>
                    <Badge tone={STATUS_TONE[p.status] || 'neutral'}>{p.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="admin-row-inspect-btn"
                      onClick={() => setSelectedRecord(p)}
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. Record Inspection Modal ──────────────────────── */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="admin-modal-backdrop" onClick={() => setSelectedRecord(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="admin-modal-content glass-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-head">
                <div>
                  <span className="admin-modal-tag mono">{selectedRecord.id}</span>
                  <h3 className="admin-modal-title">Policy Telemetry & Payload</h3>
                </div>
                <button
                  className="admin-modal-close"
                  onClick={() => setSelectedRecord(null)}
                >
                  ✕
                </button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-modal-grid">
                  <div className="admin-modal-field">
                    <span className="admin-modal-label">Customer Name</span>
                    <span className="admin-modal-val">{selectedRecord.customer}</span>
                  </div>
                  <div className="admin-modal-field">
                    <span className="admin-modal-label">Registered Vehicle</span>
                    <span className="admin-modal-val">{selectedRecord.vehicle}</span>
                  </div>
                  <div className="admin-modal-field">
                    <span className="admin-modal-label">Carrier & Plan</span>
                    <span className="admin-modal-val">{selectedRecord.provider} · Comprehensive</span>
                  </div>
                  <div className="admin-modal-field">
                    <span className="admin-modal-label">Premium & Renewal</span>
                    <span className="admin-modal-val mono">{formatINR(selectedRecord.premium)} · {selectedRecord.renewalDate}</span>
                  </div>
                </div>

                <div className="admin-modal-status-box">
                  <span className="admin-modal-status-text">Carrier API Health: Verified Operational (Playwright SLA 99.4%)</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
