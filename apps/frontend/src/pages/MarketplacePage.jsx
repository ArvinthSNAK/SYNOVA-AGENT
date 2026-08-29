import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../api/httpClient';
import PolicyDetailsModal from '../components/marketplace/PolicyDetailsModal';
import PolicyComparisonModal from '../components/marketplace/PolicyComparisonModal';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import { Car, HeartPulse, Shield, Search, LayoutGrid, Scale, Sparkles, AlertCircle, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState('recommended');
  const [minCoverage, setMinCoverage] = useState('');
  const [maxPremium, setMaxPremium] = useState('');
  const [maternityOnly, setMaternityOnly] = useState(false);
  const [opdOnly, setOpdOnly] = useState(false);
  const [criticalIllnessOnly, setCriticalIllnessOnly] = useState(false);

  // Natural Language AI Search
  const [nlQuery, setNlQuery] = useState('');
  const [nlSearching, setNlSearching] = useState(false);
  const [nlResult, setNlResult] = useState(null);

  // Modals & Comparison State
  const [viewProduct, setViewProduct] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Load Categories Overview
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load Products whenever category, filters, or sort change
  useEffect(() => {
    if (!nlResult) {
      fetchProducts();
    }
  }, [selectedCategory, sortBy, minCoverage, maxPremium, maternityOnly, opdOnly, criticalIllnessOnly]);

  const fetchCategories = async () => {
    try {
      const res = await httpClient.get('/insurance/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (sortBy) params.append('sort_by', sortBy);
      if (minCoverage) params.append('min_coverage', minCoverage);
      if (maxPremium) params.append('max_premium', maxPremium);
      if (maternityOnly) params.append('maternity', 'true');
      if (opdOnly) params.append('opd', 'true');
      if (criticalIllnessOnly) params.append('critical_illness', 'true');

      const res = await httpClient.get(`/insurance/products?${params.toString()}`);
      setProducts(res.data?.products || []);
    } catch (err) {
      setError('Unable to load insurance products. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Natural Language Search Handler
  const handleNlSearch = async (e) => {
    if (e) e.preventDefault();
    if (!nlQuery.trim()) {
      setNlResult(null);
      fetchProducts();
      return;
    }

    setNlSearching(true);
    try {
      const res = await httpClient.post('/insurance/search', { query: nlQuery.trim() });
      setNlResult(res.data);
      setProducts((res.data.results || []).map((r) => ({ ...r.product, match_score: r.match_score, rationale: r.rationale })));
    } catch (err) {
      setError('AI search failed. Please try a simpler query.');
    } finally {
      setNlSearching(false);
    }
  };

  const clearNlSearch = () => {
    setNlQuery('');
    setNlResult(null);
    fetchProducts();
  };

  // Category Helper
  const getProductCategory = (p) => {
    const raw = (p?.insurance_type || p?.category || 'motor').toLowerCase();
    if (raw.includes('health') || raw.includes('med')) return 'health';
    if (raw.includes('term') || raw.includes('life')) return 'term';
    return 'motor';
  };

  const getCategoryTitle = (cat) => {
    if (cat === 'health') return 'Health Insurance';
    if (cat === 'term') return 'Term Life Insurance';
    return 'Motor Insurance';
  };

  const [compareDisclaimer, setCompareDisclaimer] = useState(null);

  // Compare Toggle with Cross-Category Comparison Guard
  const toggleCompare = (product) => {
    if (comparedProducts.some((p) => p.id === product.id)) {
      const updated = comparedProducts.filter((p) => p.id !== product.id);
      setComparedProducts(updated);
      if (updated.length === 0) setCompareDisclaimer(null);
    } else {
      // Check for category mismatch if existing products are already selected
      if (comparedProducts.length > 0) {
        const currentCat = getProductCategory(comparedProducts[0]);
        const newCat = getProductCategory(product);
        if (currentCat !== newCat) {
          setCompareDisclaimer({
            currentCategory: getCategoryTitle(currentCat),
            newCategory: getCategoryTitle(newCat),
            productToSwitch: product,
          });
          return;
        }
      }

      if (comparedProducts.length >= 4) {
        alert('You can compare a maximum of 4 policies at once.');
        return;
      }
      setCompareDisclaimer(null);
      setComparedProducts([...comparedProducts, product]);
    }
  };

  const switchCompareCategory = (newProduct) => {
    setCompareDisclaimer(null);
    setComparedProducts([newProduct]);
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getCategoryBadge = (cat) => {
    const map = {
      motor: { label: 'Motor', bg: '#EFF6FF', color: '#1D4ED8', icon: <Car size={13} /> },
      health: { label: 'Health', bg: '#ECFDF5', color: '#047857', icon: <HeartPulse size={13} /> },
      term: { label: 'Term Life', bg: '#F5F3FF', color: '#6D28D9', icon: <Shield size={13} /> },
    };
    return map[cat?.toLowerCase()] || { label: cat, bg: '#F3F4F6', color: '#374151', icon: null };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFD', paddingBottom: 100 }}>
      {/* Hero Marketplace Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1F3A 0%, #123B66 50%, #08162B 100%)',
          color: '#FFFFFF',
          padding: '64px 24px 84px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#93C5FD',
              padding: '6px 18px',
              borderRadius: 30,
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 18,
            }}
          >
            <Sparkles size={14} color="#60A5FA" />
            Verified Policy Marketplace • 40+ Official Insurer Plans
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 46px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.15, color: '#FFFFFF' }}>
            Find, Compare & Issue Insurance Instantly
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255, 255, 255, 0.85)', maxWidth: 680, margin: '0 auto 34px', lineHeight: 1.6 }}>
            Explore verified quotes with zero paperwork across India's top underwriters. Search naturally with Euler AI or browse categories below.
          </p>

          {/* Natural Language AI Search Bar */}
          <form
            onSubmit={handleNlSearch}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '8px 10px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              maxWidth: 780,
              margin: '0 auto',
            }}
          >
            <span style={{ padding: '0 16px', color: '#2563EB', display: 'flex', alignItems: 'center' }}>
              <Search size={22} />
            </span>
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="Tell us what you need... (e.g. 'Health insurance with maternity under ₹1000/month')"
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: 15,
                fontWeight: 500,
                color: '#0F172A',
                padding: '12px 0',
                background: 'transparent',
              }}
            />
            {nlQuery && (
              <button
                type="button"
                onClick={clearNlSearch}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  color: '#64748B',
                  cursor: 'pointer',
                  marginRight: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={nlSearching}
              style={{
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '14px 26px',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(21, 101, 192, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {nlSearching ? 'Euler Searching...' : 'AI Search ➔'}
            </button>
          </form>

          {/* NLP Extracted Chips */}
          {nlResult && (
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 13, color: '#93C5FD', fontWeight: 700 }}>Euler AI Extracted:</span>
              {nlResult.parsed_intent?.category && (
                <span style={{ background: 'rgba(37, 99, 235, 0.25)', border: '1px solid rgba(37, 99, 235, 0.5)', color: '#FFFFFF', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Category: {nlResult.parsed_intent.category.toUpperCase()}
                </span>
              )}
              {nlResult.parsed_intent?.budget_max && (
                <span style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#FFFFFF', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Budget: ≤ ₹{nlResult.parsed_intent.budget_max}
                </span>
              )}
              <button
                onClick={clearNlSearch}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear AI Filter ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1280, margin: '-40px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* Category Selector Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginBottom: 32,
          }}
        >
          {[
            {
              id: 'all',
              name: 'All Categories',
              tagline: 'Explore 40+ motor, health, and term life policies',
              icon: <LayoutGrid size={24} color="#1565C0" />,
              count: (categories[0]?.product_count || 10) + (categories[1]?.product_count || 16) + (categories[2]?.product_count || 15),
            },
            {
              id: 'motor',
              name: 'Motor Insurance',
              tagline: 'Comprehensive zero-dep & roadside car/bike protection',
              icon: <Car size={24} color="#1565C0" />,
              count: categories.find((c) => c.id === 'motor')?.product_count || 10,
            },
            {
              id: 'health',
              name: 'Health Insurance',
              tagline: 'Cashless hospitalization & maternity for your family',
              icon: <HeartPulse size={24} color="#059669" />,
              count: categories.find((c) => c.id === 'health')?.product_count || 16,
            },
            {
              id: 'term',
              name: 'Term Life Insurance',
              tagline: 'High sum assured pure term security up to ₹5 Crore',
              icon: <Shield size={24} color="#7C3AED" />,
              count: categories.find((c) => c.id === 'term')?.product_count || 15,
            },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setNlResult(null);
                }}
                style={{
                  background: isSelected ? '#FFFFFF' : '#FFFFFF',
                  color: '#0F172A',
                  border: isSelected ? '2px solid #1565C0' : '1px solid rgba(11, 31, 58, 0.1)',
                  borderRadius: 20,
                  padding: '22px 20px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 12px 30px rgba(21, 101, 192, 0.15), 0 0 0 3px rgba(21, 101, 192, 0.1)' : '0 4px 15px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#1565C0' }} />
                )}
                <div
                  style={{
                    fontSize: 28,
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: isSelected ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#0B1F3A' : '#1E293B' }}>{cat.name}</div>
                    <span
                      style={{
                        background: isSelected ? '#1565C0' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {cat.count} Plans
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
                    {cat.tagline}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter & Sorting Bar */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '16px 24px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(11, 31, 58, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0B1F3A' }}>Quick Filters:</span>

            {/* Maternity Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: maternityOnly ? '1.5px solid #1565C0' : '1px solid #CBD5E1',
                background: maternityOnly ? '#EFF6FF' : '#F8FAFC',
                color: maternityOnly ? '#1565C0' : '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={maternityOnly}
                onChange={(e) => setMaternityOnly(e.target.checked)}
                style={{ display: 'none' }}
              />
              {maternityOnly ? '✓ Maternity Covered' : '+ Maternity'}
            </label>

            {/* OPD Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: opdOnly ? '1.5px solid #1565C0' : '1px solid #CBD5E1',
                background: opdOnly ? '#EFF6FF' : '#F8FAFC',
                color: opdOnly ? '#1565C0' : '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={opdOnly}
                onChange={(e) => setOpdOnly(e.target.checked)}
                style={{ display: 'none' }}
              />
              {opdOnly ? '✓ OPD Covered' : '+ OPD Cover'}
            </label>

            {/* Critical Illness Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: criticalIllnessOnly ? '1.5px solid #1565C0' : '1px solid #CBD5E1',
                background: criticalIllnessOnly ? '#EFF6FF' : '#F8FAFC',
                color: criticalIllnessOnly ? '#1565C0' : '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={criticalIllnessOnly}
                onChange={(e) => setCriticalIllnessOnly(e.target.checked)}
                style={{ display: 'none' }}
              />
              {criticalIllnessOnly ? '✓ Critical Illness' : '+ Critical Illness'}
            </label>
          </div>

          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0B1F3A' }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: 13,
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="recommended">★ Recommended</option>
              <option value="premium_asc">Price: Low to High</option>
              <option value="premium_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rating</option>
              <option value="csr_desc">Highest Claim Settlement (CSR)</option>
              <option value="coverage_desc">Highest Sum Insured</option>
              <option value="best_value">◆ Best Value</option>
            </select>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#1565C0', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A' }}>Loading Verified Insurer Policies...</div>
          </div>
        )}

        {error && (
          <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16, color: '#DC2626', textAlign: 'center', fontWeight: 700 }}>
            {error}
          </div>
        )}

        {/* Policy Grid */}
        {!loading && !error && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 24,
            }}
          >
            {products.map((p) => {
              const badge = getCategoryBadge(p.category || p.insurance_type);
              const isCompared = comparedProducts.some((cp) => cp.id === p.id);

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 22,
                    border: '1px solid rgba(11, 31, 58, 0.1)',
                    padding: 24,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Match Score Badge (if from AI search) */}
                  {p.match_score && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#FFFFFF',
                        padding: '4px 14px',
                        borderBottomLeftRadius: 14,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {p.match_score}% AI MATCH
                    </div>
                  )}

                  <div>
                    {/* Insurer & Category Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <InsurerLogoBadge insurerName={p.insurer_name} size={42} rounded={10} />
                        <div>
                          <div style={{ fontSize: 13.5, color: '#0B1F3A', fontWeight: 800, lineHeight: 1.2 }}>
                            {p.insurer_name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#D97706', fontWeight: 800, marginTop: 2 }}>
                            ★ {p.rating || 4.8} rating
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      {p.name}
                    </h3>

                    {/* Rationale if present */}
                    {p.rationale && (
                      <div style={{ fontSize: 12, color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 12px', borderRadius: 10, marginBottom: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={14} color="#059669" />
                        <span>{p.rationale}</span>
                      </div>
                    )}

                    {/* Coverage & Premium Block */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        padding: '14px 16px',
                        background: '#F8FAFC',
                        borderRadius: 14,
                        border: '1px solid #E2E8F0',
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700 }}>Coverage Limit</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#0B1F3A', marginTop: 2 }}>
                          {formatCurrency(p.coverage_amount)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700 }}>Starting Premium</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#1565C0', marginTop: 2 }}>
                          {formatCurrency(p.premium)}
                          <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>/{p.premium_frequency || 'mo'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                      {(p.features || []).slice(0, 3).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#334155', fontWeight: 500 }}>
                          <span style={{ color: '#059669', fontWeight: 900 }}>✓</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      paddingTop: 16,
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    <button
                      onClick={() => toggleCompare(p)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        background: isCompared ? '#EFF6FF' : '#FFFFFF',
                        color: isCompared ? '#1565C0' : '#475569',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isCompared ? '✓ Compared' : '+ Compare'}
                    </button>

                    <button
                      onClick={() => setViewProduct(p)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Details
                    </button>

                    <button
                      onClick={() => setBuyProduct(p)}
                      style={{
                        flex: 1,
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.3)',
                      }}
                    >
                      Buy Now ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Search size={32} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>No matching policies found</h3>
            <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 20px' }}>Try resetting your filters or search terms.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                clearNlSearch();
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: '#1565C0',
                color: '#FFFFFF',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Sticky Comparison Bar (when 1+ products selected) */}
      {comparedProducts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: 20,
            padding: '14px 24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            zIndex: 900,
            maxWidth: 760,
            width: '92%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(37, 99, 235, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={20} color="#60A5FA" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{comparedProducts.length} / 4 {getCategoryTitle(getProductCategory(comparedProducts[0]))} Selected</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#1E3A8A',
                    color: '#93C5FD',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Same Category Only
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                {comparedProducts.length === 1
                  ? `Select 1 more ${getCategoryTitle(getProductCategory(comparedProducts[0]))} to compare`
                  : `Side-by-side specs enabled for ${getCategoryTitle(getProductCategory(comparedProducts[0]))}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => {
                setComparedProducts([]);
                setCompareDisclaimer(null);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #475569',
                color: '#CBD5E1',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>

            <button
              disabled={comparedProducts.length < 2}
              onClick={() => setShowComparisonModal(true)}
              style={{
                background: comparedProducts.length >= 2 ? '#2563EB' : '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 700,
                cursor: comparedProducts.length >= 2 ? 'pointer' : 'not-allowed',
                boxShadow: comparedProducts.length >= 2 ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none',
              }}
            >
              Compare Now ({comparedProducts.length}) ➔
            </button>
          </div>
        </div>
      )}

      {/* Cross-Category Comparison Disclaimer Modal */}
      {compareDisclaimer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setCompareDisclaimer(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} color="#D97706" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Cross-Category Comparison Not Allowed
                </h3>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Insurance Class Isolation Rule
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 13.5,
                color: '#334155',
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              You currently have <strong>{compareDisclaimer.currentCategory}</strong> selected in your comparison list.
              <br /><br />
              <strong style={{ color: '#D97706' }}>Disclaimer:</strong> You cannot compare <em>Motor</em>, <em>Health</em>, and <em>Term Life</em> policies together because their core coverage parameters (such as Vehicle IDV vs Hospital Cashless vs Life Sum Assured) are completely different and cannot be evaluated side-by-side.
              <br /><br />
              Only policies belonging to the <strong>same category</strong> can be compared.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setCompareDisclaimer(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Keep {compareDisclaimer.currentCategory}
              </button>

              <button
                onClick={() => switchCompareCategory(compareDisclaimer.productToSwitch)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                Clear & Compare {compareDisclaimer.newCategory} ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {viewProduct && (
        <PolicyDetailsModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onBuyNow={(prod) => {
            setViewProduct(null);
            setBuyProduct(prod);
          }}
          onCompare={(prod) => toggleCompare(prod)}
          isCompared={comparedProducts.some((p) => p.id === viewProduct.id)}
        />
      )}

      {showComparisonModal && (
        <PolicyComparisonModal
          products={comparedProducts}
          onClose={() => setShowComparisonModal(false)}
          onRemove={(id) => setComparedProducts(comparedProducts.filter((p) => p.id !== id))}
          onBuyNow={(prod) => {
            setShowComparisonModal(false);
            setBuyProduct(prod);
          }}
        />
      )}

      {buyProduct && (
        <BuyPolicyModal
          product={buyProduct}
          onClose={() => setBuyProduct(null)}
          onSuccess={() => {
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
