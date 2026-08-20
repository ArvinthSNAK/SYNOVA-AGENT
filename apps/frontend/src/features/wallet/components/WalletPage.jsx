import React, { useState, useEffect, useCallback } from 'react';
import { Wallet as WalletIcon } from 'lucide-react';
import UserNavbar from '../../../components/layout/UserNavbar.jsx';
import EulerLauncher from '../../dashboard/components/EulerLauncher.jsx';
import WalletSummary from './WalletSummary.jsx';
import WalletFilters from './WalletFilters.jsx';
import WalletSearch from './WalletSearch.jsx';
import WalletPolicyCard from './WalletPolicyCard.jsx';
import PolicyDetailsDrawer from './PolicyDetailsDrawer.jsx';
import { fetchWalletOverview, fetchWalletPolicies, searchWalletPolicies } from '../services/walletService.js';
import './WalletPage.css';

export default function WalletPage() {
  const [overview, setOverview] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load overview data
  useEffect(() => {
    fetchWalletOverview()
      .then(setOverview)
      .catch(() => setError('Unable to load wallet overview.'));
  }, []);

  // Load policies based on filter/search
  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadPolicies = searchQuery
      ? searchWalletPolicies(searchQuery)
      : fetchWalletPolicies(activeFilter);

    loadPolicies
      .then((data) => {
        setPolicies(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load your policies.');
        setLoading(false);
      });
  }, [activeFilter, searchQuery]);

  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query) setActiveFilter('all');
  }, []);

  const handleViewDetails = useCallback((policy) => {
    setSelectedPolicy(policy);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedPolicy(null), 300);
  }, []);

  return (
    <div className="dashboard-layout mesh-ambient-bg">
      {/* Top Glass Navbar with Overview, Wallet, Policies, Applications */}
      <UserNavbar />

      <main className="wallet-content" id="main-content" tabIndex={-1}>
        {/* Page header */}
        <div className="wallet-header">
          <div className="wallet-header-top">
            <div className="wallet-icon-wrap" aria-hidden="true">
              <WalletIcon size={22} />
            </div>
            <div>
              <h1 className="wallet-title">Insurance Wallet</h1>
              <p className="wallet-subtitle">All your insurance policies and active coverage, in one place.</p>
            </div>
          </div>
          {overview && (
            <div className="wallet-phone">
              <span className="wallet-phone-label">Account</span>
              <span className="wallet-phone-value mono">{overview.user.maskedPhone}</span>
            </div>
          )}
        </div>

        {/* Summary cards */}
        {overview && <WalletSummary summary={overview.summary} />}

        {/* Filter + Search bar */}
        <div className="wallet-controls">
          <WalletFilters active={activeFilter} onChange={handleFilterChange} />
          <WalletSearch value={searchQuery} onChange={handleSearch} />
        </div>

        {/* Policy list */}
        <section className="wallet-policies" aria-label="Insurance policies">
          {loading && (
            <div className="wallet-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="wallet-skeleton-card skeleton" />
              ))}
            </div>
          )}

          {error && (
            <div className="wallet-error" role="alert">
              <p>{error}</p>
              <button className="wallet-retry-btn" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && policies.length === 0 && (
            <div className="wallet-empty">
              <WalletIcon size={40} strokeWidth={1.2} />
              <h3>No policies found</h3>
              <p>
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search.`
                  : 'No policies match the selected filter.'}
              </p>
            </div>
          )}

          {!loading && !error && policies.map((policy) => (
            <WalletPolicyCard
              key={policy.id}
              policy={policy}
              onViewDetails={() => handleViewDetails(policy)}
            />
          ))}
        </section>
      </main>

      {/* Policy details drawer */}
      <PolicyDetailsDrawer
        policy={selectedPolicy}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />

      {/* Euler floating assistant */}
      <EulerLauncher />
    </div>
  );
}
