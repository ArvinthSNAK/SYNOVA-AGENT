// SYNOVA Admin Portal — Centralized Mock Data

export const adminKPIs = {
  totalCustomers: 12482,
  activePolicies: 8920,
  renewalsDue: 642,
  quotesGenerated: 4821,
  claimsActive: 286,
};

// Chart 1: Policy Growth (Line chart)
export const policyGrowthData = [
  { month: 'Mar', policies: 4200, quotes: 2800 },
  { month: 'Apr', policies: 5100, quotes: 3200 },
  { month: 'May', policies: 6300, quotes: 3900 },
  { month: 'Jun', policies: 7400, quotes: 4100 },
  { month: 'Jul', policies: 8150, quotes: 4400 },
  { month: 'Aug', policies: 8920, quotes: 4821 },
];

// Chart 2: Renewal Trends (Bar chart)
export const renewalTrendsData = [
  { month: 'Mar', renewed: 420, pending: 80, expired: 25 },
  { month: 'Apr', renewed: 480, pending: 95, expired: 30 },
  { month: 'May', renewed: 530, pending: 110, expired: 22 },
  { month: 'Jun', renewed: 590, pending: 120, expired: 28 },
  { month: 'Jul', renewed: 610, pending: 130, expired: 19 },
  { month: 'Aug', renewed: 642, pending: 145, expired: 18 },
];

// Chart 3: Provider Distribution (Donut chart)
export const providerDistributionData = [
  { name: 'ICICI Lombard', value: 3240, color: '#0F6E6E' },
  { name: 'TATA AIG', value: 2480, color: '#D06A4E' },
  { name: 'ACKO', value: 1960, color: '#2FA36B' },
  { name: 'Synova Direct', value: 1240, color: '#2563EB' },
];

// Quote Analytics Table
export const providerQuoteAnalytics = [
  { provider: 'ICICI Lombard', quotes: 1420, avgPremium: 18200, conversion: 32, sla: '14s', status: 'Operational' },
  { provider: 'TATA AIG', quotes: 1120, avgPremium: 17950, conversion: 28, sla: '12s', status: 'Operational' },
  { provider: 'ACKO', quotes: 1320, avgPremium: 17600, conversion: 30, sla: '8s', status: 'Operational' },
  { provider: 'HDFC ERGO', quotes: 961, avgPremium: 18800, conversion: 24, sla: '21s', status: 'Operational' },
];

// Recent Activity Feed
export const adminActivityFeed = [
  { id: 'act-1', text: 'Policy renewed by customer (Naresh Kumar · Hyundai Creta)', time: '2 minutes ago', type: 'renewal' },
  { id: 'act-2', text: 'New quote comparison completed (SYN-2026-00124)', time: '15 minutes ago', type: 'quote' },
  { id: 'act-3', text: 'New customer onboarded (Priya Raman · Prime Cover Agency)', time: '42 minutes ago', type: 'user' },
  { id: 'act-4', text: 'Vehicle RC extracted via Euler vision pipeline (KA-01-XX-0000)', time: '1 hour ago', type: 'ocr' },
  { id: 'act-5', text: 'Claim submitted for review (CLM-2026-894)', time: '3 hours ago', type: 'claim' },
];

// Full Admin Policies Table Data
export const adminPolicyRecords = [
  {
    id: 'POL-901',
    customer: 'Naresh Kumar',
    vehicle: 'Hyundai Creta',
    provider: 'ICICI Lombard',
    premium: 18450,
    status: 'Active',
    renewalDate: '2026-09-25',
  },
  {
    id: 'POL-902',
    customer: 'Ramesh Kannan',
    vehicle: 'Maruti Brezza',
    provider: 'TATA AIG',
    premium: 16240,
    status: 'Expiring Soon',
    renewalDate: '2026-09-02',
  },
  {
    id: 'POL-903',
    customer: 'Divya Shankar',
    vehicle: 'Honda City',
    provider: 'ACKO',
    premium: 15980,
    status: 'Active',
    renewalDate: '2026-10-18',
  },
  {
    id: 'POL-904',
    customer: 'Arjun Mehta',
    vehicle: 'Tata Nexon EV',
    provider: 'Synova Direct',
    premium: 21500,
    status: 'Active',
    renewalDate: '2026-11-04',
  },
  {
    id: 'POL-905',
    customer: 'Neha Kulkarni',
    vehicle: 'Kia Seltos',
    provider: 'ICICI Lombard',
    premium: 19300,
    status: 'Pending',
    renewalDate: '2026-08-30',
  },
  {
    id: 'POL-906',
    customer: 'Suresh Iyer',
    vehicle: 'Mahindra XUV700',
    provider: 'HDFC ERGO',
    premium: 24800,
    status: 'Active',
    renewalDate: '2026-12-15',
  },
];

// Preserving legacy exports for backwards compatibility
export const overviewStats = {
  totalUsers: 12482,
  totalCompanies: 9,
  totalApplications: 4821,
  approvalRate: 88,
};

/* Company-wise customer breakdown for the Customers page chart */
export const usersByCompany = [
  { label: 'Apex Insurance Brokers',   name: 'Apex Insurance Brokers',   value: 2840, policies: 2110, renewals: 680, claims: 124, growth: '+14%', color: '#0F6E6E' },
  { label: 'Shield Financial Services', name: 'Shield Financial Services', value: 2390, policies: 1780, renewals: 540, claims: 98,  growth: '+9%',  color: '#2563EB' },
  { label: 'Trustline Advisors',        name: 'Trustline Advisors',        value: 1960, policies: 1400, renewals: 420, claims: 72,  growth: '+11%', color: '#D06A4E' },
  { label: 'Bharat Insurance Hub',      name: 'Bharat Insurance Hub',      value: 1680, policies: 1200, renewals: 360, claims: 61,  growth: '+6%',  color: '#8B5CF6' },
  { label: 'SecureNet Brokers',         name: 'SecureNet Brokers',         value: 1420, policies: 980,  renewals: 290, claims: 48,  growth: '+18%', color: '#059669' },
  { label: 'Prime Cover Agency',        name: 'Prime Cover Agency',        value: 1190, policies: 860,  renewals: 240, claims: 39,  growth: '+7%',  color: '#F59E0B' },
  { label: 'SafeGuard Direct',          name: 'SafeGuard Direct',          value: 740,  policies: 520,  renewals: 148, claims: 22,  growth: '+22%', color: '#EC4899' },
  { label: 'VehicleShield Co',          name: 'VehicleShield Co',          value: 262,  policies: 182,  renewals: 54,  claims: 8,   growth: '+31%', color: '#14B8A6' },
];

/* Admin Renewals mock */
export const adminRenewalsData = [
  { id: 'RNW-101', customer: 'Naresh Kumar',   vehicle: 'Hyundai Creta',   provider: 'ICICI Lombard', premium: 18450, dueDate: '2026-09-25', ncb: '20%', status: 'Due Soon' },
  { id: 'RNW-102', customer: 'Ramesh Kannan',  vehicle: 'Maruti Brezza',   provider: 'TATA AIG',      premium: 16240, dueDate: '2026-09-02', ncb: '25%', status: 'Overdue'  },
  { id: 'RNW-103', customer: 'Divya Shankar',  vehicle: 'Honda City',      provider: 'ACKO',          premium: 15980, dueDate: '2026-10-18', ncb: '20%', status: 'Upcoming' },
  { id: 'RNW-104', customer: 'Arjun Mehta',    vehicle: 'Tata Nexon EV',   provider: 'Synova Direct', premium: 21500, dueDate: '2026-11-04', ncb: '35%', status: 'Upcoming' },
  { id: 'RNW-105', customer: 'Suresh Iyer',    vehicle: 'Mahindra XUV700', provider: 'HDFC ERGO',     premium: 24800, dueDate: '2026-12-15', ncb: '30%', status: 'Upcoming' },
];

/* Admin Claims mock */
export const adminClaimsData = [
  { id: 'CLM-201', customer: 'Priya Raman',   vehicle: 'Toyota Innova',   type: 'Own Damage',    amount: 62000, provider: 'ICICI Lombard', filed: '2026-08-01', status: 'Under Review' },
  { id: 'CLM-202', customer: 'Karthik Rao',   vehicle: 'Maruti Swift',    type: 'Third Party',   amount: 28500, provider: 'TATA AIG',      filed: '2026-07-28', status: 'Approved'    },
  { id: 'CLM-203', customer: 'Meena Pillai',  vehicle: 'Honda Amaze',     type: 'Theft',         amount: 145000,provider: 'ACKO',          filed: '2026-07-20', status: 'Under Review' },
  { id: 'CLM-204', customer: 'Rajesh Nair',   vehicle: 'Kia Carens',      type: 'Own Damage',    amount: 41200, provider: 'HDFC ERGO',     filed: '2026-08-05', status: 'Settled'     },
  { id: 'CLM-205', customer: 'Sunita Devi',   vehicle: 'Hyundai i20',     type: 'Third Party',   amount: 18600, provider: 'ICICI Lombard', filed: '2026-08-10', status: 'Pending Docs'},
];

export const recentApplications = [
  { id: 'APP-3021', applicant: 'Ramesh Kannan', company: 'Apex Insurance', type: 'Renewal', insurer: 'Tata AIG', status: 'Approved', date: '2026-08-12' },
  { id: 'APP-3020', applicant: 'Divya Shankar', company: 'Shield Financial', type: 'New', insurer: 'ICICI Lombard', status: 'Pending', date: '2026-08-12' },
  { id: 'APP-3019', applicant: 'Arjun Mehta', company: 'Trustline Advisors', type: 'Renewal', insurer: 'ACKO', status: 'Approved', date: '2026-08-11' },
];

