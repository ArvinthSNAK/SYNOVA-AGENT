import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { httpClient } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import PolicyDetailsModal from '../components/marketplace/PolicyDetailsModal';
import PolicyComparisonModal from '../components/marketplace/PolicyComparisonModal';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import { Car, HeartPulse, Shield, Search, LayoutGrid, Scale, Sparkles, AlertCircle, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Authenticated Buy Now Handler
  const handleBuyNow = (product) => {
    const token = localStorage.getItem('synova_token') || localStorage.getItem('access_token');
    const isLoggedIn = Boolean(user || (token && token !== 'null' && token !== 'undefined' && token !== 'demo-token-expired'));
    if (isLoggedIn) {
      setBuyProduct(product);
    } else {
      // Store intent and redirect to login
      try {
        sessionStorage.setItem('synova_buy_after_login', JSON.stringify(product));
      } catch (_) {}
      navigate('/login', { state: { returnUrl: '/policies', selectedProduct: product } });
    }
  };

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

  const parseFeatureList = (features) => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
      if (features.includes('•')) return features.split('•').map((s) => s.trim()).filter(Boolean);
      if (features.includes(',')) return features.split(',').map((s) => s.trim()).filter(Boolean);
      if (features.includes('\n')) return features.split('\n').map((s) => s.trim()).filter(Boolean);
      return [features];
    }
    return ['Instant Paperless Issuance', '24x7 Digital Claims Support', 'Cashless Network Included'];
  };

  const getCategoryBadge = (cat) => {
    const map = {
      motor: { label: 'Motor', bg: '#DED8ED', color: '#111111', icon: <Car size={13} color="#111111" /> },
      health: { label: 'Health', bg: '#DED8ED', color: '#111111', icon: <HeartPulse size={13} color="#111111" /> },
      term: { label: 'Term Life', bg: '#DED8ED', color: '#111111', icon: <Shield size={13} color="#111111" /> },
    };
    return map[cat?.toLowerCase()] || { label: cat, bg: '#DED8ED', color: '#111111', icon: null };
  };

  return (
<<<<<<< HEAD
    <div style={{ minHeight: '100vh', background: '#EBEBEB', paddingBottom: 100 }}>
      {/* Hero Marketplace Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111111 0%, #111111 50%, #0A0A0A 100%)',
=======
    <div style={{ minHeight: '100vh', background: '#EBEBEB', color: '#1C1C1C', paddingBottom: 100 }}>
      {/* Hero Marketplace Header */}
      <div
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, rgba(222, 216, 237, 0.28) 0%, #111111 70%)',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
          color: '#FFFFFF',
          padding: '68px 24px 88px',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid rgba(222, 216, 237, 0.2)',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <span
            style={{
              background: '#DED8ED',
              color: '#111111',
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
              boxShadow: '0 4px 14px rgba(222, 216, 237, 0.3)',
            }}
          >
            <Sparkles size={14} color="#111111" />
            Verified Policy Marketplace • 40+ Official Insurer Plans
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.15, color: '#FFFFFF' }}>
            Find, Compare & Issue Insurance Instantly
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(235, 235, 235, 0.85)', maxWidth: 680, margin: '0 auto 34px', lineHeight: 1.6 }}>
            Explore verified quotes with zero paperwork across India's top underwriters. Search naturally with Euler AI or browse categories below.
          </p>

          {/* Natural Language AI Search Bar with Frosted Glassmorphism */}
          <form
            onSubmit={handleNlSearch}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(30px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
              borderRadius: 24,
              padding: '8px 10px',
              border: '1px solid rgba(222, 216, 237, 0.35)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 0 20px rgba(222, 216, 237, 0.15)',
              display: 'flex',
              alignItems: 'center',
              maxWidth: 780,
              margin: '0 auto',
              transition: 'all 0.25s ease',
            }}
          >
            <span style={{ padding: '0 16px', color: '#DED8ED', display: 'flex', alignItems: 'center' }}>
              <Search size={22} color="#DED8ED" />
            </span>
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              placeholder="Tell us what you need... (e.g. 'Health insurance under ₹1000/month')"
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: 15,
                fontWeight: 600,
                color: '#FFFFFF',
                padding: '12px 0',
                background: 'transparent',
              }}
            />
<<<<<<< HEAD
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
                  color: '#6B6B6B',
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
=======
            
            {/* Glassmorphic Search Button */}
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
            <button
              type="submit"
              disabled={nlSearching}
              style={{
<<<<<<< HEAD
                background: 'linear-gradient(135deg, #1C1C1C 0%, #0D47A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '14px 26px',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(28, 28, 28, 0.4)',
=======
                background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95) 0%, rgba(32, 32, 32, 0.85) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#DED8ED',
                border: '1px solid rgba(222, 216, 237, 0.5)',
                borderRadius: 16,
                padding: '14px 28px',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(222, 216, 237, 0.35)',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              }}
            >
              {nlSearching ? 'Euler Searching...' : 'Search ➔'}
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
              <span style={{ fontSize: 13, color: '#DED8ED', fontWeight: 700 }}>Euler AI Extracted:</span>
              {nlResult.parsed_intent?.category && (
                <span style={{ background: '#DED8ED', color: '#111111', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Category: {nlResult.parsed_intent.category.toUpperCase()}
                </span>
              )}
              {nlResult.parsed_intent?.budget_max && (
                <span style={{ background: 'rgba(222, 216, 237, 0.2)', border: '1px solid #DED8ED', color: '#FFFFFF', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Budget: ≤ ₹{nlResult.parsed_intent.budget_max}
                </span>
              )}
              <button
                onClick={clearNlSearch}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
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
<<<<<<< HEAD
              icon: <LayoutGrid size={24} color="#1C1C1C" />,
=======
              icon: <LayoutGrid size={24} color="#111111" />,
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
              count: (categories[0]?.product_count || 10) + (categories[1]?.product_count || 16) + (categories[2]?.product_count || 15),
            },
            {
              id: 'motor',
              name: 'Motor Insurance',
              tagline: 'Comprehensive zero-dep & roadside car/bike protection',
<<<<<<< HEAD
              icon: <Car size={24} color="#1C1C1C" />,
=======
              icon: <Car size={24} color="#111111" />,
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
              count: categories.find((c) => c.id === 'motor')?.product_count || 10,
            },
            {
              id: 'health',
              name: 'Health Insurance',
              tagline: 'Cashless hospitalization & maternity for your family',
              icon: <HeartPulse size={24} color="#111111" />,
              count: categories.find((c) => c.id === 'health')?.product_count || 16,
            },
            {
              id: 'term',
              name: 'Term Life Insurance',
              tagline: 'High sum assured pure term security up to ₹5 Crore',
              icon: <Shield size={24} color="#111111" />,
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
<<<<<<< HEAD
                  background: isSelected ? '#FFFFFF' : '#FFFFFF',
                  color: '#0F172A',
                  border: isSelected ? '2px solid #1C1C1C' : '1px solid rgba(28, 28, 28, 0.1)',
                  borderRadius: 20,
                  padding: '22px 20px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 12px 30px rgba(28, 28, 28, 0.15), 0 0 0 3px rgba(28, 28, 28, 0.1)' : '0 4px 15px rgba(0, 0, 0, 0.04)',
=======
                  background: isSelected ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                  color: '#1C1C1C',
                  border: isSelected ? '2px solid #111111' : '1px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 20,
                  padding: '22px 20px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 12px 30px rgba(17, 17, 17, 0.12), 0 0 0 3px rgba(222, 216, 237, 0.6)' : '0 6px 20px rgba(17, 17, 17, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
<<<<<<< HEAD
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#1C1C1C' }} />
=======
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#111111' }} />
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                )}
                <div
                  style={{
                    fontSize: 28,
                    background: isSelected ? '#DED8ED' : '#EBEBEB',
                    border: isSelected ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.08)',
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
<<<<<<< HEAD
                    <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#111111' : '#1E293B' }}>{cat.name}</div>
                    <span
                      style={{
                        background: isSelected ? '#1C1C1C' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#475569',
=======
                    <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#111111' : '#1C1C1C' }}>{cat.name}</div>
                    <span
                      style={{
                        background: isSelected ? '#111111' : '#EBEBEB',
                        color: isSelected ? '#DED8ED' : '#1C1C1C',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {cat.count} Plans
                    </span>
                  </div>
<<<<<<< HEAD
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4, lineHeight: 1.4 }}>
=======
                  <div style={{ fontSize: 12, color: '#666666', marginTop: 4, lineHeight: 1.4 }}>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                    {cat.tagline}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter & Sorting Bar with Glassmorphism */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderRadius: 20,
            padding: '16px 24px',
<<<<<<< HEAD
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(28, 28, 28, 0.1)',
=======
            boxShadow: '0 8px 28px rgba(17, 17, 17, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
<<<<<<< HEAD
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111111' }}>Quick Filters:</span>
=======
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1C' }}>Quick Filters:</span>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794

            {/* Maternity Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
<<<<<<< HEAD
                border: maternityOnly ? '1.5px solid #1C1C1C' : '1px solid #CBD5E1',
                background: maternityOnly ? '#EFF6FF' : '#F8FAFC',
                color: maternityOnly ? '#1C1C1C' : '#1C1C1C',
=======
                border: maternityOnly ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                background: maternityOnly ? '#DED8ED' : '#EBEBEB',
                color: maternityOnly ? '#111111' : '#1C1C1C',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                fontSize: 12.5,
                fontWeight: 800,
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
<<<<<<< HEAD
                border: opdOnly ? '1.5px solid #1C1C1C' : '1px solid #CBD5E1',
                background: opdOnly ? '#EFF6FF' : '#F8FAFC',
                color: opdOnly ? '#1C1C1C' : '#1C1C1C',
=======
                border: opdOnly ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                background: opdOnly ? '#DED8ED' : '#EBEBEB',
                color: opdOnly ? '#111111' : '#1C1C1C',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                fontSize: 12.5,
                fontWeight: 800,
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
<<<<<<< HEAD
                border: criticalIllnessOnly ? '1.5px solid #1C1C1C' : '1px solid #CBD5E1',
                background: criticalIllnessOnly ? '#EFF6FF' : '#F8FAFC',
                color: criticalIllnessOnly ? '#1C1C1C' : '#1C1C1C',
=======
                border: criticalIllnessOnly ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                background: criticalIllnessOnly ? '#DED8ED' : '#EBEBEB',
                color: criticalIllnessOnly ? '#111111' : '#1C1C1C',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                fontSize: 12.5,
                fontWeight: 800,
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
<<<<<<< HEAD
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111111' }}>Sort By:</span>
=======
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1C' }}>Sort By:</span>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: '1.5px solid rgba(17, 17, 17, 0.15)',
                background: '#FFFFFF',
                color: '#1C1C1C',
                fontSize: 13,
                fontWeight: 800,
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
<<<<<<< HEAD
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B6B6B', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#1C1C1C', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111111' }}>Loading Verified Insurer Policies...</div>
=======
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#666666', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #EBEBEB', borderTopColor: '#111111', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1C1C1C' }}>Loading Verified Insurer Policies...</div>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
          </div>
        )}

        {error && (
          <div style={{ padding: 24, background: '#FFFFFF', border: '1.5px solid #111111', borderRadius: 16, color: '#111111', textAlign: 'center', fontWeight: 800 }}>
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
            {products.map((p, pIdx) => {
              const badge = getCategoryBadge(p.category || p.insurance_type);
              const isCompared = comparedProducts.some((cp) => cp.id === p.id);

              const featureList = parseFeatureList(p.features);

              return (
                <div
                  key={p.id}
                  className={`glass-interactive-card anim-fade-in stagger-${(pIdx % 6) + 1}`}
                  style={{
<<<<<<< HEAD
                    background: '#FFFFFF',
                    borderRadius: 22,
                    border: '1px solid rgba(28, 28, 28, 0.1)',
                    padding: 24,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
=======
                    background: 'rgba(255, 255, 255, 0.72)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: 24,
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    padding: 26,
                    boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06), 0 2px 8px 0 rgba(17, 17, 17, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 24px 48px rgba(17, 17, 17, 0.12), 0 4px 12px rgba(222, 216, 237, 0.2), inset 0 1px 0 #FFFFFF';
                    e.currentTarget.style.borderColor = 'rgba(222, 216, 237, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 36px 0 rgba(17, 17, 17, 0.06), 0 2px 8px 0 rgba(17, 17, 17, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.85)';
                  }}
                >
                  {/* Match Score Badge with Glass Accent */}
                  {p.match_score && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'rgba(17, 17, 17, 0.88)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#DED8ED',
                        border: '1px solid rgba(222, 216, 237, 0.4)',
                        padding: '5px 16px',
                        borderBottomLeftRadius: 16,
                        fontSize: 11.5,
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {p.match_score}% AI MATCH
                    </div>
                  )}

                  <div>
                    {/* Insurer & Category Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <InsurerLogoBadge insurerName={p.insurer_name} size={44} rounded={12} />
                        <div>
<<<<<<< HEAD
                          <div style={{ fontSize: 13.5, color: '#111111', fontWeight: 800, lineHeight: 1.2 }}>
=======
                          <div style={{ fontSize: 14, color: '#1C1C1C', fontWeight: 800, lineHeight: 1.2 }}>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                            {p.insurer_name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#111111', fontWeight: 800, marginTop: 2 }}>
                            ★ {p.rating || 4.8} rating
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          background: 'rgba(222, 216, 237, 0.85)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          color: '#111111',
                          border: '1px solid rgba(222, 216, 237, 0.95)',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1C', margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                      {p.name}
                    </h3>

                    {/* Rationale if present */}
                    {p.rationale && (
                      <div style={{ fontSize: 12, color: '#111111', background: 'rgba(222, 216, 237, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid #111111', padding: '6px 12px', borderRadius: 10, marginBottom: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={14} color="#111111" />
                        <span>{p.rationale}</span>
                      </div>
                    )}

                    {/* Coverage & Premium Block with Glass Effect */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        padding: '14px 16px',
                        background: 'rgba(235, 235, 235, 0.65)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.7)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
                        marginBottom: 16,
                      }}
                    >
                      <div>
<<<<<<< HEAD
                        <div style={{ fontSize: 11.5, color: '#6B6B6B', fontWeight: 700 }}>Coverage Limit</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#111111', marginTop: 2 }}>
=======
                        <div style={{ fontSize: 11.5, color: '#666666', fontWeight: 700 }}>Coverage Limit</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#1C1C1C', marginTop: 2 }}>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                          {formatCurrency(p.coverage_amount)}
                        </div>
                      </div>
                      <div>
<<<<<<< HEAD
                        <div style={{ fontSize: 11.5, color: '#6B6B6B', fontWeight: 700 }}>Starting Premium</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#1C1C1C', marginTop: 2 }}>
                          {formatCurrency(p.premium)}
                          <span style={{ fontSize: 11.5, color: '#6B6B6B', fontWeight: 600 }}>/{p.premium_frequency || 'mo'}</span>
=======
                        <div style={{ fontSize: 11.5, color: '#666666', fontWeight: 700 }}>Starting Premium</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#111111', marginTop: 2 }}>
                          {formatCurrency(p.premium)}
                          <span style={{ fontSize: 11.5, color: '#666666', fontWeight: 600 }}>/{p.premium_frequency || 'mo'}</span>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
<<<<<<< HEAD
                      {(p.features || []).slice(0, 3).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#1C1C1C', fontWeight: 500 }}>
                          <span style={{ color: '#059669', fontWeight: 900 }}>✓</span>
=======
                      {featureList.slice(0, 3).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#1C1C1C', fontWeight: 500 }}>
                          <span style={{ color: '#111111', fontWeight: 900 }}>✓</span>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
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
                      borderTop: '1px solid rgba(17, 17, 17, 0.08)',
                    }}
                  >
                    <button
                      onClick={() => toggleCompare(p)}
                      className="glass-btn"
                      style={{
                        padding: '10px 14px',
<<<<<<< HEAD
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        background: isCompared ? '#EFF6FF' : '#FFFFFF',
                        color: isCompared ? '#1C1C1C' : '#475569',
=======
                        borderRadius: 12,
                        border: isCompared ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.2)',
                        background: isCompared ? '#DED8ED' : 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: isCompared ? '#111111' : '#1C1C1C',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isCompared ? '✓ Compared' : '+ Compare'}
                    </button>

                    <button
                      onClick={() => setViewProduct(p)}
                      className="glass-btn"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.2)',
                        background: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: '#1C1C1C',
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Details
                    </button>

                    <button
                      onClick={() => handleBuyNow(p)}
                      className="glass-btn"
                      style={{
                        flex: 1,
                        padding: '10px 18px',
                        borderRadius: 12,
                        border: 'none',
<<<<<<< HEAD
                        background: 'linear-gradient(135deg, #1C1C1C 0%, #0D47A1 100%)',
=======
                        background: '#111111',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
<<<<<<< HEAD
                        boxShadow: '0 2px 8px rgba(28, 28, 28, 0.3)',
=======
                        boxShadow: '0 4px 14px rgba(17, 17, 17, 0.3)',
                        transition: 'all 0.15s ease',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
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
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F1F5F9', color: '#6B6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Search size={32} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>No matching policies found</h3>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: '6px 0 20px' }}>Try resetting your filters or search terms.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                clearNlSearch();
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
<<<<<<< HEAD
                background: '#1C1C1C',
                color: '#FFFFFF',
=======
                background: '#111111',
                color: '#DED8ED',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
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
            background: '#111111',
            color: '#FFFFFF',
            borderRadius: 20,
            padding: '14px 24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(222, 216, 237, 0.25)',
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
                background: '#DED8ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={20} color="#111111" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{comparedProducts.length} / 4 {getCategoryTitle(getProductCategory(comparedProducts[0]))} Selected</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(222, 216, 237, 0.2)',
                    color: '#DED8ED',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Same Category Only
                </span>
              </div>
<<<<<<< HEAD
              <div style={{ fontSize: 11.5, color: '#9A9A9A', marginTop: 2 }}>
=======
              <div style={{ fontSize: 11.5, color: '#A0A0A0', marginTop: 2 }}>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#EBEBEB',
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
<<<<<<< HEAD
                background: comparedProducts.length >= 2 ? '#2563EB' : '#1C1C1C',
                color: '#FFFFFF',
=======
                background: comparedProducts.length >= 2 ? '#DED8ED' : 'rgba(222, 216, 237, 0.2)',
                color: comparedProducts.length >= 2 ? '#111111' : '#888888',
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                border: 'none',
                borderRadius: 10,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 800,
                cursor: comparedProducts.length >= 2 ? 'pointer' : 'not-allowed',
                boxShadow: comparedProducts.length >= 2 ? '0 4px 14px rgba(222, 216, 237, 0.35)' : 'none',
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
            backgroundColor: 'rgba(17, 17, 17, 0.75)',
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
              border: '1px solid rgba(17, 17, 17, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#DED8ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} color="#111111" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1C1C1C', margin: 0 }}>
                  Cross-Category Comparison Not Allowed
                </h3>
<<<<<<< HEAD
                <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
=======
                <div style={{ fontSize: 12, color: '#666666', marginTop: 2 }}>
>>>>>>> 2fd0876d819724e2b20ebe3348b1334f621a7794
                  Insurance Class Isolation Rule
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#EBEBEB',
                border: '1px solid rgba(17, 17, 17, 0.08)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 13.5,
                color: '#1C1C1C',
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              You currently have <strong>{compareDisclaimer.currentCategory}</strong> selected in your comparison list.
              <br /><br />
              <strong style={{ color: '#111111' }}>Disclaimer:</strong> You cannot compare <em>Motor</em>, <em>Health</em>, and <em>Term Life</em> policies together because their core coverage parameters (such as Vehicle IDV vs Hospital Cashless vs Life Sum Assured) are completely different and cannot be evaluated side-by-side.
              <br /><br />
              Only policies belonging to the <strong>same category</strong> can be compared.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setCompareDisclaimer(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid rgba(17, 17, 17, 0.2)',
                  background: '#FFFFFF',
                  color: '#1C1C1C',
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
                  background: '#111111',
                  color: '#DED8ED',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(17, 17, 17, 0.25)',
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
            handleBuyNow(prod);
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
            handleBuyNow(prod);
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
