// SYNOVA — Insurance Application Mock Data
// Mirrors expected API response shapes for easy future backend integration.

export const APPLICATION_ID = 'SYN-NEW-2026-00124';

// ─── Vehicle Extraction Simulation ───────────────────────────────────────────
// These are returned when Euler "extracts" vehicle info from natural language.

export const vehicleExtractionMock = {
  make: 'Hyundai',
  model: 'Creta',
  year: '2023',
  fuelType: 'Petrol',
  city: 'Bangalore',
  registrationNumber: 'KA-01-XX-0000',
  variant: 'SX(O) Turbo',
  ownershipType: 'First Owner',
};

// ─── Document Extraction Simulation ──────────────────────────────────────────
// Returned when user "uploads" an RC document.

export const documentExtractionMock = {
  registrationNumber: 'KA-01-MF-4567',
  make: 'Hyundai',
  model: 'Creta',
  year: '2023',
  fuelType: 'Petrol',
  variant: 'SX(O) Turbo',
  ownerName: 'Naresh Kumar',
  registrationDate: '2023-05-18',
  engineNumber: 'G4NAXXX1234',
  chassisNumber: 'MALC851FXPM123456',
};

// ─── Coverage Options ─────────────────────────────────────────────────────────

export const coverageOptions = [
  {
    id: 'comprehensive',
    label: 'Comprehensive',
    tagline: 'Recommended',
    description:
      'Protects against own damage, theft, natural disasters, and third-party liability.',
    features: ['Own Damage', 'Theft Protection', 'Natural Disaster', 'Third-Party Liability', 'Personal Accident'],
    estimatedPremium: 18450,
    isRecommended: true,
  },
  {
    id: 'third-party',
    label: 'Third-Party',
    tagline: 'Essential',
    description:
      'Covers third-party liability as required by law. Mandatory for all vehicles on Indian roads.',
    features: ['Third-Party Liability', 'Personal Accident Cover'],
    estimatedPremium: 4200,
    isRecommended: false,
  },
];

// ─── Add-on Options ──────────────────────────────────────────────────────────

export const addonOptions = [
  {
    id: 'zero-dep',
    label: 'Zero Depreciation',
    description: 'Get full claim value for replaced parts without depreciation deductions.',
    price: 2100,
    eulerRecommended: true,
    availableFor: ['comprehensive'],
  },
  {
    id: 'rsa',
    label: 'Roadside Assistance',
    description: '24/7 towing, fuel delivery, flat tyre, and battery jump-start anywhere in India.',
    price: 599,
    eulerRecommended: true,
    availableFor: ['comprehensive'],
  },
  {
    id: 'engine-protection',
    label: 'Engine Protection',
    description: 'Covers repair costs for engine and gearbox damage caused by water ingression or oil leakage.',
    price: 1299,
    eulerRecommended: false,
    availableFor: ['comprehensive'],
  },
  {
    id: 'consumables',
    label: 'Consumables Cover',
    description: 'Covers the cost of consumable items like engine oil, nuts, and bolts during a claim.',
    price: 499,
    eulerRecommended: false,
    availableFor: ['comprehensive'],
  },
  {
    id: 'key-replacement',
    label: 'Key Replacement',
    description: 'Covers the cost of replacing lost or stolen car keys and associated locksmith charges.',
    price: 299,
    eulerRecommended: false,
    availableFor: ['comprehensive', 'third-party'],
  },
  {
    id: 'pa-cover',
    label: 'Personal Accident Cover',
    description: 'Enhanced personal accident cover for the owner-driver beyond the standard limit.',
    price: 750,
    eulerRecommended: false,
    availableFor: ['comprehensive', 'third-party'],
  },
];

// ─── Quote Providers ─────────────────────────────────────────────────────────
// These represent the Playwright-automated insurers. Status will be managed by backend.

export const quoteProviders = [
  {
    id: 'icici-lombard',
    name: 'ICICI Lombard',
    shortName: 'ICICI',
    logoColor: '#F05A27',
    status: 'idle', // idle | processing | completed | error
    premium: null,
    idv: null,
  },
  {
    id: 'tata-aig',
    name: 'TATA AIG',
    shortName: 'TATA',
    logoColor: '#0057A7',
    status: 'idle',
    premium: null,
    idv: null,
  },
  {
    id: 'acko',
    name: 'Acko',
    shortName: 'ACKO',
    logoColor: '#7B2D8B',
    status: 'idle',
    premium: null,
    idv: null,
  },
];

// ─── Simulated Quote Results ──────────────────────────────────────────────────
// Used to populate /new-insurance/quotes once comparison is complete.

export const mockQuoteResults = [
  {
    providerId: 'icici-lombard',
    providerName: 'ICICI Lombard',
    premium: 18450,
    idv: 840000,
    deductible: 2000,
    coverageType: 'Comprehensive',
    addons: ['Zero Depreciation', 'Roadside Assistance'],
    isRecommended: true,
    benefits: ['Cashless Garages: 6500+', 'Claim Settlement: 99.2%', '24/7 Support'],
  },
  {
    providerId: 'tata-aig',
    providerName: 'TATA AIG',
    premium: 17200,
    idv: 830000,
    deductible: 2500,
    coverageType: 'Comprehensive',
    addons: ['Zero Depreciation'],
    isRecommended: false,
    benefits: ['Cashless Garages: 5500+', 'Claim Settlement: 98.1%', '24/7 Support'],
  },
  {
    providerId: 'acko',
    providerName: 'Acko',
    premium: 15800,
    idv: 820000,
    deductible: 3000,
    coverageType: 'Comprehensive',
    addons: [],
    isRecommended: false,
    benefits: ['Digital-first Claims', 'Claim Settlement: 97.5%', 'App-based Support'],
  },
];

// ─── Euler Conversation Scripts ───────────────────────────────────────────────
// Step-aware context messages shown by Euler at start of each step.

export const eulerStepContextMessages = {
  1: "Hi Naresh 👋\n\nI'm Euler, your insurance assistant.\n\nI'll help you find the right auto insurance without making you fill out a long form.\n\nLet's start with your vehicle.",
  2: "Your vehicle details look good.\n\nNow let's choose the right coverage for your Hyundai Creta.\n\nI'll explain your options and make a recommendation.",
  3: "Almost there.\n\nLet's review everything before we compare quotes. You can edit any section if needed.",
  4: "Your application is complete.\n\nI'm now comparing available insurance options from leading providers. This usually takes about 30 seconds.",
};

// ─── Vehicle Make Options ─────────────────────────────────────────────────────

export const vehicleMakes = [
  'Hyundai', 'Maruti Suzuki', 'Tata', 'Mahindra', 'Honda', 'Toyota',
  'Kia', 'MG', 'Volkswagen', 'Skoda', 'Renault', 'Nissan',
  'Ford', 'Jeep', 'BMW', 'Mercedes-Benz', 'Audi', 'Other',
];

export const twoWheelerMakes = [
  'Hero', 'Honda', 'TVS', 'Bajaj', 'Royal Enfield', 'Yamaha',
  'Suzuki', 'KTM', 'Ola Electric', 'Ather', 'Triumph', 'Other',
];

export const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export const ownershipTypes = ['First Owner', 'Second Owner', 'Third Owner', 'Fourth Owner +'];

export const indianCities = [
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Chandigarh',
  'Kochi', 'Bhopal', 'Indore', 'Nagpur', 'Visakhapatnam', 'Other',
];
