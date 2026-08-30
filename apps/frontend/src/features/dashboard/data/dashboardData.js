// SYNOVA Dashboard — Centralized Mock Data
// This structure mirrors the expected API response shape for easy future integration.

export const dashboardData = {
  user: {
    id: 'USR-001',
    name: 'Naresh',
    fullName: 'Naresh Kumar',
    email: 'naresh.kumar@email.com',
    phone: '+91 98765 43210',
    customerSince: '2023-04-12',
    role: 'Customer',
  },

  vehicle: {
    make: 'Hyundai',
    model: 'Creta',
    variant: 'SX(O) Turbo',
    registration: 'KA-01-XX-0000',
    year: 2023,
    fuel: 'Petrol',
    seats: 5,
    color: 'Phantom Black',
  },

  policy: {
    id: 'AUTO-123456',
    insurer: 'ICICI Lombard',
    insurerLogo: null,
    type: 'Comprehensive Auto Insurance',
    typeShort: 'Comprehensive',
    status: 'active',
    startDate: '2025-09-25',
    expiryDate: '2026-09-25',
    premium: 18450,
    idv: 840000,
    ncb: 20,
    deductible: 2000,
  },

  coverage: [
    { id: 'own-damage', label: 'Own Damage', included: true },
    { id: 'third-party', label: 'Third Party Liability', included: true },
    { id: 'theft', label: 'Theft Protection', included: true },
    { id: 'natural-disaster', label: 'Natural Disaster', included: true },
    { id: 'personal-accident', label: 'Personal Accident', included: true },
  ],

  addons: [
    { id: 'zero-dep', label: 'Zero Depreciation', included: true },
    { id: 'rsa', label: 'Roadside Assistance', included: true },
    { id: 'engine-protection', label: 'Engine Protection', included: true },
    { id: 'consumables', label: 'Consumables Cover', included: false },
  ],

  application: {
    id: 'SYN-2026-00124',
    title: 'New Auto Insurance',
    type: 'new',
    status: 'quotes_generated',
    submittedDate: '2026-08-10',
    steps: [
      { id: 'info_submitted', label: 'Information Submitted', status: 'completed', date: '10 Aug 2026' },
      { id: 'reviewed', label: 'Application Reviewed', status: 'completed', date: '11 Aug 2026' },
      { id: 'quotes_generated', label: 'Quotes Generated', status: 'current', date: '12 Aug 2026' },
      { id: 'quote_selected', label: 'Quote Selected', status: 'pending', date: null },
      { id: 'policy_processing', label: 'Policy Processing', status: 'pending', date: null },
      { id: 'completed', label: 'Completed', status: 'pending', date: null },
    ],
  },

  claims: {
    thisYear: 0,
    active: 0,
    lastClaim: null,
    history: [],
  },

  documents: [
    {
      id: 'doc-001',
      name: 'Policy Certificate',
      type: 'PDF',
      size: '842 KB',
      date: '25 Sep 2025',
      category: 'policy',
    },
    {
      id: 'doc-002',
      name: 'Premium Receipt',
      type: 'PDF',
      size: '156 KB',
      date: '25 Sep 2025',
      category: 'receipt',
    },
    {
      id: 'doc-003',
      name: 'Insurance Schedule',
      type: 'PDF',
      size: '1.2 MB',
      date: '25 Sep 2025',
      category: 'schedule',
    },
  ],

  activity: [
    {
      id: 'act-001',
      label: 'Quote comparison completed',
      detail: 'SYN-2026-00124',
      dateLabel: 'Today',
      date: '2026-08-14',
      type: 'application',
    },
    {
      id: 'act-002',
      label: 'Policy document uploaded',
      detail: 'Insurance Schedule',
      dateLabel: 'Yesterday',
      date: '2026-08-13',
      type: 'document',
    },
    {
      id: 'act-003',
      label: 'Application submitted',
      detail: 'New Auto Insurance',
      dateLabel: '10 Aug',
      date: '2026-08-10',
      type: 'application',
    },
    {
      id: 'act-004',
      label: 'Policy renewed successfully',
      detail: 'AUTO-123456',
      dateLabel: '25 Sep 2025',
      date: '2025-09-25',
      type: 'policy',
    },
  ],

  notifications: [
    {
      id: 'notif-001',
      title: 'Policy renewal reminder',
      message: 'Your ICICI Lombard policy expires in 43 days.',
      time: '2 hours ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-002',
      title: 'Application update',
      message: 'Quotes have been generated for SYN-2026-00124.',
      time: '1 day ago',
      read: false,
      type: 'info',
    },
    {
      id: 'notif-003',
      title: 'Document ready',
      message: 'Your insurance certificate is available for download.',
      time: '5 days ago',
      read: true,
      type: 'success',
    },
  ],
};

// Helper: days until policy expires
export function getDaysUntilExpiry(expiryDateStr) {
  const today = new Date();
  const expiry = new Date(expiryDateStr);
  const diff = expiry - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Helper: policy validity percentage (0–1)
export function getPolicyValidityPercent(startDateStr, expiryDateStr) {
  const start = new Date(startDateStr);
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  const total = expiry - start;
  const elapsed = today - start;
  return Math.min(1, Math.max(0, elapsed / total));
}

// Helper: expiry urgency level
export function getExpiryLevel(daysRemaining) {
  if (daysRemaining > 60) return 'safe';
  if (daysRemaining > 30) return 'normal';
  if (daysRemaining > 7) return 'warning';
  return 'danger';
}

// Helper: format Indian currency
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper: format large INR values (e.g. 8,40,000 -> ₹8.4L)
export function formatINRShort(amount) {
  if (amount >= 100000) {
    return `\u20B9${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `\u20B9${(amount / 1000).toFixed(0)}K`;
  }
  return `\u20B9${amount}`;
}

// Helper: format date
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
