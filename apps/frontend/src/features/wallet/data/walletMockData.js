// SYNOVA Wallet — Centralized Mock Data
// Simulates policies from Synova and third-party insurance providers.

export const walletUser = {
  phone: '+91 98765 43210',
  maskedPhone: '+91 987XX XXX10',
};

export const walletSummary = {
  totalPolicies: 3,
  activePolicies: 2,
  expiringSoon: 1,
  totalAnnualPremium: 52900,
};

export const walletPolicies = [
  {
    id: 'wp-001',
    provider: 'SYNOVA',
    providerType: 'synova',
    policyType: 'Auto Insurance',
    policyNumber: 'SYN-AUTO-00123',
    vehicle: {
      make: 'Hyundai',
      model: 'Creta',
      variant: 'SX(O) Turbo',
      registration: 'KA-01-XX-0000',
      year: 2023,
    },
    coverageType: 'Comprehensive',
    premium: 18450,
    startDate: '2025-09-25',
    expiryDate: '2026-09-25',
    status: 'active',
    addons: ['Zero Depreciation', 'Roadside Assistance', 'Engine Protection'],
    idv: 840000,
    ncb: 20,
    deductible: 2000,
  },
  {
    id: 'wp-002',
    provider: 'ICICI Lombard',
    providerType: 'third-party',
    policyType: 'Auto Insurance',
    policyNumber: 'ICICI-MH-784523',
    vehicle: {
      make: 'Maruti Suzuki',
      model: 'Swift',
      variant: 'ZXi+',
      registration: 'MH-12-AB-4567',
      year: 2022,
    },
    coverageType: 'Comprehensive',
    premium: 16200,
    startDate: '2025-10-18',
    expiryDate: '2026-10-18',
    status: 'active',
    addons: ['Zero Depreciation', 'Return to Invoice'],
    idv: 620000,
    ncb: 25,
    deductible: 1500,
  },
  {
    id: 'wp-003',
    provider: 'TATA AIG',
    providerType: 'third-party',
    policyType: 'Auto Insurance',
    policyNumber: 'TATA-KA-991024',
    vehicle: {
      make: 'Honda',
      model: 'City',
      variant: 'V CVT',
      registration: 'KA-05-MN-8901',
      year: 2021,
    },
    coverageType: 'Third Party',
    premium: 18250,
    startDate: '2025-09-02',
    expiryDate: '2026-09-02',
    status: 'expiring-soon',
    addons: ['Personal Accident Cover'],
    idv: 720000,
    ncb: 35,
    deductible: 2000,
  },
];
