// SYNOVA — Renewal Mock Data
// All mock data for Journey 3 (Renewal).
// Replace service calls with real API when backend is ready.

export const RENEWAL_ID = 'SYN-RNW-2026-00041';

// ─── Current Policy (from Dashboard / user state) ─────────────────────────────
// This simulates data already held in the user's account.
export const currentPolicyMock = {
  provider: 'ICICI Lombard',
  policyNumber: 'AUTO-123456',
  policyType: 'Comprehensive',
  startDate: '2025-09-26',
  expiryDate: '2026-09-25',
  previousPremium: 17900,
  ncb: '20%',
  idv: 840000,
  deductible: 2000,
  vehicle: {
    registrationNumber: 'KA-01-MF-4567',
    make: 'Hyundai',
    model: 'Creta',
    variant: 'SX(O) Turbo',
    year: '2023',
    fuelType: 'Petrol',
    city: 'Bangalore',
  },
  customer: {
    name: 'Naresh Kumar',
    mobile: '+91 98765 43210',
    email: 'naresh.kumar@email.com',
    address: '15, 3rd Cross, Indiranagar, Bangalore - 560038',
  },
  addons: ['zero-dep', 'rsa'],
  status: 'active', // active | expiring-soon | expired
  daysRemaining: 40,
};

// ─── Policy OCR Extraction ────────────────────────────────────────────────────
// Returned when user uploads existing policy PDF.
// Confidence levels: 'high' | 'medium' | 'low'
export const policyExtractionMock = {
  provider: { value: 'ICICI Lombard', confidence: 'high' },
  policyNumber: { value: 'AUTO-123456', confidence: 'high' },
  policyType: { value: 'Comprehensive', confidence: 'high' },
  startDate: { value: '2025-09-26', confidence: 'high' },
  expiryDate: { value: '2026-09-25', confidence: 'high' },
  previousPremium: { value: '17900', confidence: 'medium' },
  ncb: { value: '20%', confidence: 'medium' },
  idv: { value: '840000', confidence: 'high' },
  deductible: { value: '2000', confidence: 'medium' },
  // Vehicle
  registrationNumber: { value: 'KA-01-MF-4567', confidence: 'low' },
  make: { value: 'Hyundai', confidence: 'high' },
  model: { value: 'Creta', confidence: 'high' },
  variant: { value: 'SX(O) Turbo', confidence: 'medium' },
  year: { value: '2023', confidence: 'high' },
  fuelType: { value: 'Petrol', confidence: 'high' },
  city: { value: 'Bangalore', confidence: 'high' },
  // Customer
  name: { value: 'Naresh Kumar', confidence: 'high' },
  mobile: { value: '+91 98765 43210', confidence: 'medium' },
  email: { value: 'naresh.kumar@email.com', confidence: 'medium' },
  // Add-ons
  addons: { value: ['zero-dep', 'rsa'], confidence: 'medium' },
};

// ─── OCR Extraction Stages ────────────────────────────────────────────────────
export const extractionStages = [
  { id: 'upload', label: 'Document uploaded' },
  { id: 'detect', label: 'Policy detected' },
  { id: 'policy', label: 'Extracting policy details' },
  { id: 'vehicle', label: 'Extracting vehicle details' },
  { id: 'coverage', label: 'Extracting coverage details' },
  { id: 'expiry', label: 'Reading expiry information' },
];

// ─── Renewal Quote Results ────────────────────────────────────────────────────
// Future: Playwright fills real forms and returns these structures.
export const renewalQuoteResults = [
  {
    providerId: 'icici-lombard',
    providerName: 'ICICI Lombard',
    logoColor: '#F05A27',
    premium: 18450,
    previousPremium: 17900,
    premiumDiff: +550,
    idv: 840000,
    deductible: 2000,
    coverageType: 'Comprehensive',
    ncb: '20%',
    addons: ['zero-dep', 'rsa'],
    benefits: ['Cashless Garages: 6500+', 'Claim Settlement: 99.2%', '24/7 Support', 'Free Annual Inspection'],
    isRecommended: false,
    status: 'completed',
  },
  {
    providerId: 'tata-aig',
    providerName: 'TATA AIG',
    logoColor: '#0057A7',
    premium: 17430,
    previousPremium: 17900,
    premiumDiff: -470,
    idv: 825000,
    deductible: 2000,
    coverageType: 'Comprehensive',
    ncb: '20%',
    addons: ['zero-dep', 'rsa'],
    benefits: ['Cashless Garages: 5500+', 'Claim Settlement: 98.1%', '24/7 Support'],
    isRecommended: true,
    status: 'completed',
  },
  {
    providerId: 'acko',
    providerName: 'Acko',
    logoColor: '#7B2D8B',
    premium: 16200,
    previousPremium: 17900,
    premiumDiff: -1700,
    idv: 815000,
    deductible: 3000,
    coverageType: 'Comprehensive',
    ncb: '20%',
    addons: ['zero-dep'],
    benefits: ['Digital-first Claims', 'Claim Settlement: 97.5%', 'App-based Support'],
    isRecommended: false,
    status: 'completed',
  },
];

// ─── Renewal Add-ons ─────────────────────────────────────────────────────────
export const renewalAddonOptions = [
  {
    id: 'zero-dep',
    label: 'Zero Depreciation',
    description: 'Get full claim value for replaced parts without depreciation deductions.',
    whyItMatters: 'Since your vehicle is 3 years old, depreciation can significantly reduce claim payouts.',
    price: 2100,
    eulerRecommended: true,
    currentlyIncluded: true,
  },
  {
    id: 'rsa',
    label: 'Roadside Assistance',
    description: '24/7 towing, fuel delivery, flat tyre, and battery jump-start anywhere in India.',
    whyItMatters: 'You used this service twice in the previous year based on policy history.',
    price: 599,
    eulerRecommended: true,
    currentlyIncluded: true,
  },
  {
    id: 'engine-protection',
    label: 'Engine Protection',
    description: 'Covers engine and gearbox damage caused by water ingression or oil leakage.',
    whyItMatters: 'Recommended for vehicles in high-rainfall areas like Bangalore.',
    price: 1299,
    eulerRecommended: false,
    currentlyIncluded: false,
  },
  {
    id: 'consumables',
    label: 'Consumables Cover',
    description: 'Covers consumable items like engine oil, nuts, and bolts during a claim.',
    whyItMatters: 'Often overlooked but adds up during repair claims.',
    price: 499,
    eulerRecommended: false,
    currentlyIncluded: false,
  },
  {
    id: 'pa-cover',
    label: 'Personal Accident Cover',
    description: 'Enhanced personal accident cover for the owner-driver beyond the standard limit.',
    whyItMatters: 'Mandatory cover — upgrading gives better protection.',
    price: 750,
    eulerRecommended: false,
    currentlyIncluded: false,
  },
];

// ─── Euler Renewal Scripts ────────────────────────────────────────────────────
export const eulerRenewalMessages = {
  welcome: `Hi Naresh 👋\n\nI found your existing **ICICI Lombard** policy.\n\nI've already filled in most of your renewal information.\n\nLet's quickly review what changed before we compare options.`,
  afterUpload: `I've read your policy document.\n\nI've extracted your policy, vehicle, and coverage details.\n\nPlease review and confirm everything looks correct before we continue.`,
  coverageStep: `Your previous policy included **Zero Depreciation** and **Roadside Assistance**.\n\nWould you like to keep these add-ons for your renewal?`,
  reviewStep: `Everything looks good.\n\nOnce you confirm, I'll start comparing renewal quotes from available providers.`,
  quotingStep: `Comparing renewal quotes across providers.\n\nThis usually takes about 30 seconds.`,
};

// ─── Quote Providers ─────────────────────────────────────────────────────────
export const renewalProviders = [
  { id: 'icici-lombard', name: 'ICICI Lombard', logoColor: '#F05A27', status: 'idle' },
  { id: 'tata-aig', name: 'TATA AIG', logoColor: '#0057A7', status: 'idle' },
  { id: 'acko', name: 'Acko', logoColor: '#7B2D8B', status: 'idle' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getPolicyStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: 'expired', daysRemaining: diffDays, label: `Expired ${Math.abs(diffDays)} days ago` };
  if (diffDays <= 30) return { status: 'expiring-soon', daysRemaining: diffDays, label: `${diffDays} days remaining` };
  return { status: 'active', daysRemaining: diffDays, label: `${diffDays} days remaining` };
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
