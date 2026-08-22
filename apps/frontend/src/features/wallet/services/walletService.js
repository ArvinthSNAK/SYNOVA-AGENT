// SYNOVA Wallet — Service Layer
// Returns mock data now; replace implementations with API calls later.

import { walletUser, walletSummary, walletPolicies } from '../data/walletMockData.js';

/**
 * Fetch wallet overview (user info + summary metrics).
 * Future: GET /api/wallet/overview
 */
export async function fetchWalletOverview() {
  // Simulate network delay
  await delay(400);
  return { user: walletUser, summary: walletSummary };
}

/**
 * Fetch all wallet policies, optionally filtered.
 * Future: GET /api/wallet/policies?filter=active
 */
export async function fetchWalletPolicies(filter = 'all') {
  await delay(600);
  let policies = [...walletPolicies];

  switch (filter) {
    case 'active':
      policies = policies.filter((p) => p.status === 'active');
      break;
    case 'expiring-soon':
      policies = policies.filter((p) => p.status === 'expiring-soon');
      break;
    case 'expired':
      policies = policies.filter((p) => p.status === 'expired');
      break;
    case 'third-party':
      policies = policies.filter((p) => p.providerType === 'third-party');
      break;
    case 'synova':
      policies = policies.filter((p) => p.providerType === 'synova');
      break;
    default:
      break;
  }

  return policies;
}

/**
 * Search wallet policies by query string.
 * Future: GET /api/wallet/policies/search?q=...
 */
export async function searchWalletPolicies(query) {
  await delay(300);
  const q = query.toLowerCase().trim();
  if (!q) return walletPolicies;

  return walletPolicies.filter(
    (p) =>
      p.provider.toLowerCase().includes(q) ||
      p.policyNumber.toLowerCase().includes(q) ||
      `${p.vehicle.make} ${p.vehicle.model}`.toLowerCase().includes(q) ||
      p.vehicle.registration.toLowerCase().includes(q)
  );
}

/**
 * Fetch single policy details.
 * Future: GET /api/wallet/policies/:id
 */
export async function fetchPolicyDetails(policyId) {
  await delay(300);
  return walletPolicies.find((p) => p.id === policyId) || null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
