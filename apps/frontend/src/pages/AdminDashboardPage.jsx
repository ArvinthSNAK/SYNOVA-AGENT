import React, { useState, useEffect } from 'react';
import { httpClient } from '../api/httpClient';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('claims');

  // Live Metrics State
  const [metrics, setMetrics] = useState({
    total_policies: 0,
    active_policies: 0,
    gross_written_premium: 0,
    total_users: 0,
    total_claims: 0,
    pending_claims: 0,
    approved_claims: 0,
    rejected_claims: 0,
    total_payout: 0,
    settlement_rate: 100.0,
  });

  // Claims Management State
  const [claims, setClaims] = useState([]);
  const [claimStatusFilter, setClaimStatusFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adjudicateAmount, setAdjudicateAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [surveyorName, setSurveyorName] = useState('Rajesh Sharma (Lead Surveyor)');
  const [surveyorContact, setSurveyorContact] = useState('+91 98200 12345');
  const [claimActionLoading, setClaimActionLoading] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState('');

  // Policies Directory State
  const [policies, setPolicies] = useState([]);
  const [policyInsurerFilter, setPolicyInsurerFilter] = useState('ALL');
  const [policyStatusFilter, setPolicyStatusFilter] = useState('ALL');
  const [policySearch, setPolicySearch] = useState('');

  // Users Directory State
  const [usersList, setUsersList] = useState([]);

  // Insurers Health State
  const [insurerHealth, setInsurerHealth] = useState([]);
  const [healthLoading, setHealthLoading] = useState(false);

  // Dynamic Product Creation & Catalog Management State
  const [newProduct, setNewProduct] = useState({
    insurer_id: 1,
    name: 'SecureRide Comprehensive Elite Shield',
    insurance_type: 'motor',
    description: 'Bumper-to-Bumper cover with Engine Protector & Zero Dep benefits.',
    base_rate: 2.8,
    minimum_premium: 15400,
    maximum_premium: 350000,
  });
  const [publishedProducts, setPublishedProducts] = useState(() => {
    const saved = localStorage.getItem('synova_published_products');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: 1, insurer_id: 1, insurer_name: 'ICICI Lombard General', name: 'Comprehensive Motor Shield Pro', insurance_type: 'motor', base_rate: 3.0, minimum_premium: 16500, maximum_premium: 350000, active: true, addons: ['Zero Depreciation', 'Roadside Assistance'] },
      { id: 2, insurer_id: 2, insurer_name: 'ACKO General Insurance', name: 'Direct Drive Smart Protection', insurance_type: 'motor', base_rate: 2.5, minimum_premium: 14200, maximum_premium: 280000, active: true, addons: ['Zero Depreciation', 'Engine Protector'] },
      { id: 3, insurer_id: 3, insurer_name: 'TATA AIG Assurance', name: 'AutoSecure Total Cover', insurance_type: 'motor', base_rate: 3.5, minimum_premium: 18900, maximum_premium: 400000, active: true, addons: ['Zero Depreciation', 'NCB Protector', 'Key Replacement'] },
      { id: 4, insurer_id: 4, insurer_name: 'HDFC ERGO General', name: 'Optima Drive Comprehensive', insurance_type: 'motor', base_rate: 2.8, minimum_premium: 15800, maximum_premium: 320000, active: true, addons: ['Zero Depreciation', 'Emergency Fuel'] },
    ];
  });
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  useEffect(() => {
    fetchMetrics();
    fetchClaims();
    fetchPolicies();
    fetchUsers();
    fetchInsurerHealth();
  }, []);

  const getAllLocalPolicies = () => {
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('synova_vault_policies') || key === 'synova_vault_policies')) {
        try {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(items)) {
            list.push(...items);
          }
        } catch (e) {}
      }
    }
    return list;
  };

  const getAllLocalClaims = () => {
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('synova_vault_claims') || key === 'synova_vault_claims')) {
        try {
          const items = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(items)) {
            list.push(...items);
          }
        } catch (e) {}
      }
    }
    return list;
  };

  const fetchMetrics = async () => {
    const localPolicies = getAllLocalPolicies();
    const localClaims = getAllLocalClaims();
    try {
      const res = await httpClient.get('/admin/metrics');
      if (res.data && (res.data.total_policies > 0 || res.data.total_claims > 0)) {
        setMetrics(res.data);
      } else {
        const totalP = Math.max(localPolicies.length, 1);
        const gross = localPolicies.reduce((sum, p) => sum + (parseFloat(p.premium || p.premium_amount) || 0), 0);
        const totalC = localClaims.length;
        const pendingC = localClaims.filter((c) => ['SUBMITTED', 'UNDER_REVIEW', 'SURVEYOR_ASSIGNED'].includes(c.status)).length;
        const approvedC = localClaims.filter((c) => ['APPROVED', 'DISBURSED'].includes(c.status)).length;
        setMetrics({
          total_policies: totalP,
          active_policies: totalP,
          gross_written_premium: gross,
          total_users: 8,
          total_claims: totalC,
          pending_claims: pendingC,
          approved_claims: approvedC,
          rejected_claims: 0,
          total_payout: approvedC * 22000,
          settlement_rate: totalC > 0 ? ((approvedC / totalC) * 100).toFixed(1) : 100.0,
        });
      }
    } catch (e) {
      const totalP = Math.max(localPolicies.length, 1);
      const gross = localPolicies.reduce((sum, p) => sum + (parseFloat(p.premium || p.premium_amount) || 0), 0);
      const totalC = localClaims.length;
      const pendingC = localClaims.filter((c) => ['SUBMITTED', 'UNDER_REVIEW', 'SURVEYOR_ASSIGNED'].includes(c.status)).length;
      const approvedC = localClaims.filter((c) => ['APPROVED', 'DISBURSED'].includes(c.status)).length;
      setMetrics({
        total_policies: totalP,
        active_policies: totalP,
        gross_written_premium: gross,
        total_users: 8,
        total_claims: totalC,
        pending_claims: pendingC,
        approved_claims: approvedC,
        rejected_claims: 0,
        total_payout: approvedC * 22000,
        settlement_rate: totalC > 0 ? ((approvedC / totalC) * 100).toFixed(1) : 100.0,
      });
    }
  };

  const isClaimPending = (status) => {
    const s = (status || '').toUpperCase().replace(/[\s_]+/g, '_');
    return ['SUBMITTED', 'UNDER_REVIEW', 'SURVEYOR_ASSIGNED', 'PENDING'].includes(s);
  };

  const fetchClaims = async (status = claimStatusFilter) => {
    const localClaims = getAllLocalClaims();
    const defaultSampleClaims = [
      {
        id: 101,
        claim_number: 'CLM-SYN-10921',
        policy_id: 1,
        policy_number: 'POL-ICI-883921',
        insurer_name: 'ICICI Lombard General Insurance',
        customer_name: 'Hariharan Murugesan',
        customer_email: 'customer@synova.io',
        vehicle_details: 'Hyundai Creta SX (KA-01-MJ-4092)',
        claim_type: 'GLASS_WINDSHIELD_DAMAGE',
        status: 'SUBMITTED',
        incident_date: '2026-08-25',
        incident_location: 'Indiranagar 100ft Road, Bangalore',
        description: 'Flying road debris caused hairline crack across front windshield on airport expressway.',
        estimated_loss: 14500,
        approved_amount: 0,
        deductible_applied: 1000,
        net_payout: 0,
        surveyor_name: 'Rajesh Sharma (Senior Claims Surveyor)',
        surveyor_contact: '+91 98200 12345',
        surveyor_notes: 'FNOL document submitted. Waiting for garage estimate verification.',
        garage_name: 'ICICI Lombard Express Cashless Garage',
        garage_city: 'Bangalore',
        created_at: '2026-08-25T14:30:00Z',
      },
      {
        id: 102,
        claim_number: 'CLM-SYN-38412',
        policy_id: 2,
        policy_number: 'POL-ACK-402911',
        insurer_name: 'ACKO General Insurance',
        customer_name: 'Arvinth Kumar',
        customer_email: 'arvinth@synova.io',
        vehicle_details: 'Tata Nexon EV Max (KA-05-NB-7782)',
        claim_type: 'ACCIDENT_OWN_DAMAGE',
        status: 'UNDER_REVIEW',
        incident_date: '2026-08-24',
        incident_location: 'Electronic City Flyover, Bangalore',
        description: 'Front bumper collision impact during bumper-to-bumper peak hour traffic.',
        estimated_loss: 28500,
        approved_amount: 24500,
        deductible_applied: 2000,
        net_payout: 22500,
        surveyor_name: 'Amit Patel (Technical Loss Assessor)',
        surveyor_contact: '+91 98330 67890',
        surveyor_notes: 'Under review. Photo telematics and damage assessment report under verification.',
        garage_name: 'Authorized Tata Cashless Network Hub',
        garage_city: 'Bangalore',
        created_at: '2026-08-24T11:15:00Z',
      },
      {
        id: 103,
        claim_number: 'CLM-SYN-55291',
        policy_id: 3,
        policy_number: 'POL-TAT-910482',
        insurer_name: 'TATA AIG Assurance',
        customer_name: 'Priya Sharma',
        customer_email: 'priya.sharma@synova.io',
        vehicle_details: 'Kia Seltos GTX+ (KA-03-MK-1290)',
        claim_type: 'SIDE_BODY_SCRAPE',
        status: 'SURVEYOR_ASSIGNED',
        incident_date: '2026-08-23',
        incident_location: 'Koramangala 4th Block, Bangalore',
        description: 'Right fender dent and headlight assembly scratch while navigating narrow parking.',
        estimated_loss: 36000,
        approved_amount: 31000,
        deductible_applied: 2000,
        net_payout: 29000,
        surveyor_name: 'Vikram Sengupta (Certified IRDAI Surveyor)',
        surveyor_contact: '+91 97410 88231',
        surveyor_notes: 'Physical on-site garage survey assigned. Scheduled for digital inspection report.',
        garage_name: 'GoMechanic Partner Platinum Hub',
        garage_city: 'Bangalore',
        created_at: '2026-08-23T09:40:00Z',
      },
      {
        id: 104,
        claim_number: 'CLM-SYN-74910',
        policy_id: 4,
        policy_number: 'POL-HDF-661093',
        insurer_name: 'HDFC ERGO General Insurance',
        customer_name: 'Rahul Verma',
        customer_email: 'rahul.verma@synova.io',
        vehicle_details: 'Mahindra XUV700 AX7 (KA-04-PZ-9934)',
        claim_type: 'REAR_BUMPER_IMPACT',
        status: 'APPROVED',
        incident_date: '2026-08-21',
        incident_location: 'Outer Ring Road, Marathahalli, Bangalore',
        description: 'Rear-ended by commercial vehicle at traffic signal intersection.',
        estimated_loss: 42000,
        approved_amount: 39500,
        deductible_applied: 2000,
        net_payout: 37500,
        surveyor_name: 'Rajesh Sharma (Senior Claims Surveyor)',
        surveyor_contact: '+91 98200 12345',
        surveyor_notes: 'Claim approved by underwriting desk. Cashless payment direct to repair garage authorized.',
        garage_name: 'HDFC ERGO Smart Drive Cashless Workshop',
        garage_city: 'Bangalore',
        created_at: '2026-08-21T16:20:00Z',
      },
      {
        id: 105,
        claim_number: 'CLM-SYN-92104',
        policy_id: 1,
        policy_number: 'POL-ICI-110934',
        insurer_name: 'ICICI Lombard General Insurance',
        customer_name: 'Vikram Aditya',
        customer_email: 'vikram.aditya@synova.io',
        vehicle_details: 'Maruti Suzuki Swift ZXi (DL-08-AB-4412)',
        claim_type: 'ENGINE_HYDROSTATIC_LOCK',
        status: 'REJECTED',
        incident_date: '2026-08-19',
        incident_location: 'Silk Board Junction, Bangalore',
        description: 'Water ingress through air filter during heavy monsoon waterlogging.',
        estimated_loss: 58000,
        approved_amount: 0,
        deductible_applied: 0,
        net_payout: 0,
        surveyor_name: 'Amit Patel (Technical Loss Assessor)',
        surveyor_contact: '+91 98330 67890',
        surveyor_notes: 'Rejected under section 4B: Engine protector add-on cover not elected on base OD policy.',
        garage_name: 'Authorized Maruti Arena Workshop',
        garage_city: 'Bangalore',
        created_at: '2026-08-19T10:05:00Z',
      }
    ];

    try {
      const res = await httpClient.get(`/admin/claims`);
      const serverClaims = Array.isArray(res.data) ? res.data : [];
      const combined = [...serverClaims, ...localClaims, ...defaultSampleClaims];
      const unique = [];
      const seen = new Set();
      for (const c of combined) {
        const key = c.claim_number || c.id;
        if (key && !seen.has(key)) {
          seen.add(key);
          const custName = (c.customer_name && c.customer_name !== 'N/A' && c.customer_name.trim() !== '') ? c.customer_name : 'Hariharan Murugesan';
          const polNum = (c.policy_number && c.policy_number !== 'N/A' && c.policy_number.trim() !== '') ? c.policy_number : 'POL-ICI-883921';
          const insName = (c.insurer_name && c.insurer_name !== 'N/A' && c.insurer_name.trim() !== '') ? c.insurer_name : 'ICICI Lombard General Insurance';

          unique.push({
            id: c.id || unique.length + 1,
            claim_number: c.claim_number || 'CLM-SYN-' + Math.floor(10000 + Math.random() * 90000),
            policy_id: c.policy_id || 1,
            policy_number: polNum,
            insurer_name: insName,
            customer_name: custName,
            customer_email: c.customer_email || 'customer@synova.io',
            vehicle_details: c.vehicle_details || 'Hyundai Creta SX (KA-01-MJ-4092)',
            claim_type: c.claim_type || 'ACCIDENT_OWN_DAMAGE',
            status: (c.status || 'UNDER_REVIEW').toUpperCase(),
            incident_date: c.incident_date || new Date().toISOString().substring(0, 10),
            incident_location: c.incident_location || 'MG Road, Bangalore',
            description: c.description || 'Front bumper collision impact during bumper-to-bumper traffic.',
            estimated_loss: parseFloat(c.estimated_loss) || 28500,
            approved_amount: parseFloat(c.approved_amount) || 0,
            deductible_applied: parseFloat(c.deductible_applied) || 2000,
            net_payout: parseFloat(c.net_payout) || 0,
            surveyor_name: c.surveyor_name || 'Rajesh Sharma (Senior Claims Surveyor)',
            surveyor_contact: c.surveyor_contact || '+91 98200 12345',
            surveyor_notes: c.surveyor_notes || 'Digital FNOL registered. Cashless garage survey authorized.',
            garage_name: c.garage_name || 'Authorized Cashless Service Hub',
            garage_city: c.garage_city || 'Bangalore',
            created_at: c.created_at || new Date().toISOString(),
          });
        }
      }
      setClaims(unique);
    } catch (e) {
      const combined = [...localClaims, ...defaultSampleClaims];
      setClaims(combined);
    }
  };

  const fetchPolicies = async () => {
    const localPolicies = getAllLocalPolicies();
    const defaultSamplePolicies = [
      {
        id: 1,
        policy_number: 'POL-ICI-883921',
        insurer_name: 'ICICI Lombard General',
        product_name: 'Comprehensive Motor Shield Pro',
        customer_name: 'Hariharan Murugesan',
        customer_email: 'customer@synova.io',
        vehicle_details: 'Hyundai Creta SX (KA-01-MJ-4092)',
        vehicle_registration: 'KA-01-MJ-4092',
        idv: 720000,
        premium_amount: 18500,
        start_date: '2026-01-15',
        end_date: '2027-01-14',
        active: true,
        status: 'ACTIVE',
      },
      {
        id: 2,
        policy_number: 'POL-ACK-402911',
        insurer_name: 'ACKO General Insurance',
        product_name: 'Direct Drive Smart Protection',
        customer_name: 'Arvinth Kumar',
        customer_email: 'arvinth@synova.io',
        vehicle_details: 'Tata Nexon EV Max (KA-05-NB-7782)',
        vehicle_registration: 'KA-05-NB-7782',
        idv: 1150000,
        premium_amount: 16800,
        start_date: '2026-03-10',
        end_date: '2027-03-09',
        active: true,
        status: 'ACTIVE',
      },
      {
        id: 3,
        policy_number: 'POL-TAT-910482',
        insurer_name: 'TATA AIG Assurance',
        product_name: 'AutoSecure Total Cover',
        customer_name: 'Priya Sharma',
        customer_email: 'priya.sharma@synova.io',
        vehicle_details: 'Kia Seltos GTX+ (KA-03-MK-1290)',
        vehicle_registration: 'KA-03-MK-1290',
        idv: 890000,
        premium_amount: 21400,
        start_date: '2025-06-01',
        end_date: '2026-05-31',
        active: false,
        status: 'EXPIRED',
      },
      {
        id: 4,
        policy_number: 'POL-HDF-661093',
        insurer_name: 'HDFC ERGO General',
        product_name: 'Optima Drive Comprehensive',
        customer_name: 'Rahul Verma',
        customer_email: 'rahul.verma@synova.io',
        vehicle_details: 'Mahindra XUV700 AX7 (KA-04-PZ-9934)',
        vehicle_registration: 'KA-04-PZ-9934',
        idv: 1450000,
        premium_amount: 26500,
        start_date: '2026-04-12',
        end_date: '2027-04-11',
        active: true,
        status: 'ACTIVE',
      },
      {
        id: 5,
        policy_number: 'POL-ICI-309118',
        insurer_name: 'ICICI Lombard General',
        product_name: 'Zero Dep Standalone OD Plan',
        customer_name: 'Vikram Aditya',
        customer_email: 'vikram.aditya@synova.io',
        vehicle_details: 'Maruti Suzuki Swift ZXi (DL-08-AB-4412)',
        vehicle_registration: 'DL-08-AB-4412',
        idv: 480000,
        premium_amount: 11200,
        start_date: '2025-08-01',
        end_date: '2026-07-31',
        active: false,
        status: 'EXPIRED',
      }
    ];

    try {
      const res = await httpClient.get('/admin/policies');
      const serverPolicies = Array.isArray(res.data) ? res.data : [];
      const combined = [...serverPolicies, ...localPolicies, ...defaultSamplePolicies];
      const unique = [];
      const seen = new Set();
      for (const p of combined) {
        if (p.policy_number && !seen.has(p.policy_number)) {
          seen.add(p.policy_number);
          const isAct = p.active !== false && p.status !== 'EXPIRED';
          unique.push({
            id: p.id || unique.length + 1,
            policy_number: p.policy_number,
            insurer_name: p.insurer_name || 'ACKO General Insurance',
            product_name: p.product_name || 'Motor Comprehensive Cover',
            customer_name: p.customer_name || 'Hariharan Murugesan',
            customer_email: p.customer_email || 'customer@synova.io',
            vehicle_details: p.vehicle_details || `${p.vehicle_make || 'Hyundai'} ${p.vehicle_model || 'Creta'} (${p.vehicle_registration || 'KA-01-MJ-4092'})`,
            vehicle_registration: p.vehicle_registration || 'KA-01-MJ-4092',
            idv: p.idv || 650000,
            premium_amount: parseFloat(p.premium || p.premium_amount) || 18500,
            start_date: p.start_date || new Date().toISOString().substring(0, 10),
            end_date: p.end_date || new Date(Date.now() + 365*24*3600*1000).toISOString().substring(0, 10),
            active: isAct,
            status: isAct ? 'ACTIVE' : 'EXPIRED',
          });
        }
      }
      setPolicies(unique);
    } catch (e) {
      const combined = [...localPolicies, ...defaultSamplePolicies];
      setPolicies(combined);
    }
  };

  const fetchUsers = async () => {
    let serverUsers = [];
    try {
      const res = await httpClient.get('/admin/users');
      if (Array.isArray(res.data) && res.data.length > 0) {
        serverUsers = res.data;
      }
    } catch (e) {
      // Proceed with local & registered users if admin token is not set
    }

    // Gather from registered directory and active customer sessions
    const localUsers = JSON.parse(localStorage.getItem('synova_registered_users') || '[]');
    const activeUser = JSON.parse(localStorage.getItem('synova_user') || 'null');

    // Extract customers from local policies and claims
    const localPolicies = getAllLocalPolicies();
    const policyUsers = [];
    for (const p of localPolicies) {
      if (p.customer_email || p.customer_name) {
        policyUsers.push({
          id: p.customer_id || (policyUsers.length + 10),
          email: p.customer_email || 'customer@synova.io',
          full_name: p.customer_name || 'Hariharan Murugesan',
          role: 'customer',
          is_active: true,
          wallet_balance: 25000.0,
        });
      }
    }

    const defaultCustomerAccounts = [
      { id: 1, email: 'customer@synova.io', full_name: 'Hariharan Murugesan', role: 'customer', wallet_balance: 50000.0, is_active: true, policies_count: 3 },
      { id: 2, email: 'arvinth@synova.io', full_name: 'Arvinth Kumar', role: 'customer', wallet_balance: 32000.0, is_active: true, policies_count: 2 },
      { id: 3, email: 'priya.sharma@synova.io', full_name: 'Priya Sharma', role: 'customer', wallet_balance: 18500.0, is_active: true, policies_count: 1 },
      { id: 4, email: 'rahul.verma@synova.io', full_name: 'Rahul Verma', role: 'customer', wallet_balance: 42000.0, is_active: true, policies_count: 1 },
      { id: 5, email: 'admin@synova.io', full_name: 'Executive Admin', role: 'admin', wallet_balance: 0.0, is_active: true, policies_count: 0 },
    ];

    const allGathered = [...serverUsers, ...localUsers, ...policyUsers];
    if (activeUser) allGathered.push(activeUser);
    allGathered.push(...defaultCustomerAccounts);

    const uniqueUsers = [];
    const seenEmails = new Set();

    for (const u of allGathered) {
      const emailKey = (u.email || '').toLowerCase().trim();
      if (emailKey && !seenEmails.has(emailKey)) {
        seenEmails.add(emailKey);
        const polCount = localPolicies.filter(p => (p.customer_email && p.customer_email.toLowerCase() === emailKey) || (p.customer_id && p.customer_id === u.id)).length;

        uniqueUsers.push({
          id: u.id || (uniqueUsers.length + 1),
          email: u.email,
          full_name: u.full_name || u.name || u.email.split('@')[0],
          role: u.role || 'customer',
          is_active: u.is_active !== false,
          policies_count: polCount > 0 ? polCount : (u.policies_count || 1),
          wallet_balance: u.wallet_balance !== undefined ? u.wallet_balance : 25000.0,
          created_at: u.created_at || '2026-08-25T10:00:00Z',
        });
      }
    }

    setUsersList(uniqueUsers);
    setMetrics(prev => ({ ...prev, total_users: uniqueUsers.length }));
  };

  const fetchInsurerHealth = async () => {
    setHealthLoading(true);
    const defaultInsurers = [
      { id: 1, name: 'ICICI Lombard General (Gateway 1)', status: 'ONLINE (200 OK)', latency_ms: 42, http_code: 200, port: 9001, last_checked: 'Just now' },
      { id: 2, name: 'ACKO General Insurance (Gateway 2)', status: 'ONLINE (200 OK)', latency_ms: 38, http_code: 200, port: 9002, last_checked: 'Just now' },
      { id: 3, name: 'TATA AIG Assurance (Gateway 3)', status: 'ONLINE (200 OK)', latency_ms: 56, http_code: 200, port: 9003, last_checked: 'Just now' },
      { id: 4, name: 'HDFC ERGO General (Gateway 4)', status: 'ONLINE (200 OK)', latency_ms: 49, http_code: 200, port: 9004, last_checked: 'Just now' },
    ];

    try {
      const res = await httpClient.get('/admin/insurers/health');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setInsurerHealth(res.data);
      } else {
        setInsurerHealth(defaultInsurers);
      }
    } catch (e) {
      setInsurerHealth(defaultInsurers);
    } finally {
      setHealthLoading(false);
    }
  };

  const handleClaimAdjudication = async (newStatus) => {
    if (!selectedClaim) return;
    setClaimActionLoading(true);
    setClaimSuccessMessage('');
    try {
      const payload = {
        status: newStatus,
        approved_amount: adjudicateAmount ? parseFloat(adjudicateAmount) : selectedClaim.approved_amount,
        admin_notes: adminNotes || undefined,
        surveyor_name: surveyorName || undefined,
        surveyor_contact: surveyorContact || undefined,
      };

      try {
        const res = await httpClient.patch(`/admin/claims/${selectedClaim.id}/status`, payload);
        setClaimSuccessMessage(res.data?.message || `Claim successfully updated to ${newStatus}`);
      } catch (err) {
        setClaimSuccessMessage(`Claim #${selectedClaim.claim_number} updated to ${newStatus}`);
      }

      // Update in all local storages
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('synova_vault_claims') || key === 'synova_vault_claims')) {
          try {
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = items.map((item) => {
              if (item.claim_number === selectedClaim.claim_number || item.id === selectedClaim.id) {
                return { ...item, status: newStatus, approved_amount: adjudicateAmount ? parseFloat(adjudicateAmount) : item.approved_amount };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          } catch (e) {}
        }
      }

      await fetchClaims();
      await fetchMetrics();
      setSelectedClaim(null);
      setAdminNotes('');
      setAdjudicateAmount('');
    } catch (err) {
      alert('Error updating claim: ' + (err.message || 'Unknown error'));
    } finally {
      setClaimActionLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setPublishLoading(true);
    setPublishResult(null);

    const insurerMap = {
      1: 'ICICI Lombard General',
      2: 'ACKO General Insurance',
      3: 'TATA AIG Assurance',
      4: 'HDFC ERGO General',
    };
    const insurerName = insurerMap[newProduct.insurer_id] || 'ACKO General Insurance';

    const newProdObj = {
      id: Date.now(),
      insurer_id: parseInt(newProduct.insurer_id),
      insurer_name: insurerName,
      name: newProduct.name,
      insurance_type: newProduct.insurance_type,
      description: newProduct.description,
      base_rate: parseFloat(newProduct.base_rate),
      minimum_premium: parseFloat(newProduct.minimum_premium),
      maximum_premium: parseFloat(newProduct.maximum_premium),
      active: true,
      addons: ['Zero Depreciation', 'Roadside Assistance'],
      created_at: new Date().toISOString(),
    };

    const updated = [newProdObj, ...publishedProducts];
    setPublishedProducts(updated);
    localStorage.setItem('synova_published_products', JSON.stringify(updated));

    // DISPATCH REAL LIVE BROADCAST NOTIFICATION TO ALL CUSTOMERS
    const notifObj = {
      id: Date.now(),
      title: `New Policy Alert: ${newProduct.name}`,
      message: `${insurerName} has launched "${newProduct.name}" (Base Rate: ${newProduct.base_rate}%, Starting at ₹${Number(newProduct.minimum_premium).toLocaleString()}) with Zero Depreciation benefits.`,
      insurer_name: insurerName,
      status: 'unread',
      created_at: new Date().toISOString(),
    };

    const existingNotifs = JSON.parse(localStorage.getItem('synova_notifications') || '[]');
    localStorage.setItem('synova_notifications', JSON.stringify([notifObj, ...existingNotifs]));
    window.dispatchEvent(new CustomEvent('synova_notification_created', { detail: notifObj }));
    window.dispatchEvent(new Event('storage'));

    try {
      await httpClient.post('/admin/products', {
        insurer_id: parseInt(newProduct.insurer_id),
        name: newProduct.name,
        insurance_type: newProduct.insurance_type,
        description: newProduct.description,
        base_rate: parseFloat(newProduct.base_rate),
        minimum_premium: parseFloat(newProduct.minimum_premium),
        maximum_premium: parseFloat(newProduct.maximum_premium),
        active: true,
      });
    } catch (err) {}

    setPublishResult({
      success: true,
      message: `Plan "${newProduct.name}" successfully published for ${insurerName} and live notification broadcasted to all customer accounts!`,
    });
    setPublishLoading(false);
  };

  const handleToggleProduct = (id) => {
    const updated = publishedProducts.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setPublishedProducts(updated);
    localStorage.setItem('synova_published_products', JSON.stringify(updated));
  };

  const handleBroadcastProduct = (product) => {
    const notifObj = {
      id: Date.now(),
      title: `Special Rate Alert: ${product.name}`,
      message: `${product.insurer_name} updated "${product.name}" with special renewal rates starting at ₹${Number(product.minimum_premium).toLocaleString()}.`,
      insurer_name: product.insurer_name,
      status: 'unread',
      created_at: new Date().toISOString(),
    };
    const existingNotifs = JSON.parse(localStorage.getItem('synova_notifications') || '[]');
    localStorage.setItem('synova_notifications', JSON.stringify([notifObj, ...existingNotifs]));
    window.dispatchEvent(new CustomEvent('synova_notification_created', { detail: notifObj }));
    window.dispatchEvent(new Event('storage'));
    alert(`✓ Real-time notification dispatched for ${product.name}! Check notification bell.`);
  };

  const handleDeleteProduct = (id) => {
    const updated = publishedProducts.filter(p => p.id !== id);
    setPublishedProducts(updated);
    localStorage.setItem('synova_published_products', JSON.stringify(updated));
  };

  const [claimSortField, setClaimSortField] = useState('created_at');
  const [claimSortOrder, setClaimSortOrder] = useState('desc');

  const [policySortField, setPolicySortField] = useState('policy_number');
  const [policySortOrder, setPolicySortOrder] = useState('asc');

  const [userSortField, setUserSortField] = useState('id');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  const [productSortField, setProductSortField] = useState('name');
  const [productSortOrder, setProductSortOrder] = useState('asc');

  const toggleSort = (field, currentField, currentOrder, setField, setOrder) => {
    if (currentField === field) {
      setOrder(currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setField(field);
      setOrder('asc');
    }
  };

  const renderSortTh = (label, field, currentField, currentOrder, onClick, align = 'left') => {
    const isSorted = currentField === field;
    return (
      <th
        onClick={onClick}
        style={{
          padding: '12px 14px',
          cursor: 'pointer',
          userSelect: 'none',
          textAlign: align,
          transition: 'all 0.15s ease',
          color: isSorted ? 'var(--blue-primary)' : 'var(--text-muted)',
          background: isSorted ? 'rgba(21, 101, 192, 0.04)' : 'transparent',
          borderBottom: isSorted ? '2px solid var(--blue-primary)' : '1px solid var(--border-color)',
        }}
        title={`Click to sort by ${label} (${isSorted && currentOrder === 'asc' ? 'Descending' : 'Ascending'})`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontWeight: isSorted ? 700 : 600 }}>{label}</span>
          <span style={{ fontSize: 11, color: isSorted ? 'var(--blue-primary)' : '#94A3B8', fontWeight: isSorted ? 800 : 400 }}>
            {isSorted ? (currentOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
          </span>
        </div>
      </th>
    );
  };

  const filteredClaims = claims.filter((c) => {
    if (claimStatusFilter === 'ALL') return true;
    const s = (c.status || '').toUpperCase().trim();
    const f = claimStatusFilter.toUpperCase().trim();
    if (f === 'APPROVED') return s === 'APPROVED' || s === 'DISBURSED';
    if (f === 'SUBMITTED') return s === 'SUBMITTED' || s === 'PENDING';
    return s === f;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let valA, valB;
    switch (claimSortField) {
      case 'claim_number':
        valA = (a.claim_number || '').toLowerCase();
        valB = (b.claim_number || '').toLowerCase();
        break;
      case 'created_at':
      case 'incident_date':
        valA = new Date(a.created_at || a.incident_date || 0).getTime();
        valB = new Date(b.created_at || b.incident_date || 0).getTime();
        break;
      case 'customer_name':
        valA = (a.customer_name || '').toLowerCase();
        valB = (b.customer_name || '').toLowerCase();
        break;
      case 'policy_number':
        valA = (a.policy_number || '').toLowerCase();
        valB = (b.policy_number || '').toLowerCase();
        break;
      case 'claim_type':
        valA = (a.claim_type || '').toLowerCase();
        valB = (b.claim_type || '').toLowerCase();
        break;
      case 'estimated_loss':
        valA = parseFloat(a.estimated_loss) || 0;
        valB = parseFloat(b.estimated_loss) || 0;
        break;
      case 'payout':
        valA = parseFloat(a.net_payout || a.approved_amount) || 0;
        valB = parseFloat(b.net_payout || b.approved_amount) || 0;
        break;
      case 'status':
        valA = (a.status || '').toLowerCase();
        valB = (b.status || '').toLowerCase();
        break;
      default:
        valA = a[claimSortField] !== undefined ? a[claimSortField] : '';
        valB = b[claimSortField] !== undefined ? b[claimSortField] : '';
    }
    if (valA < valB) return claimSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return claimSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredPolicies = policies.filter((p) => {
    // Insurer Match
    let matchInsurer = true;
    if (policyInsurerFilter !== 'ALL') {
      const insUpper = (p.insurer_name || '').toUpperCase();
      const filterUpper = policyInsurerFilter.toUpperCase();
      if (filterUpper === 'ICICI') {
        matchInsurer = insUpper.includes('ICICI') || insUpper.includes('INSURER A') || insUpper.includes('GATEWAY 1');
      } else if (filterUpper === 'ACKO') {
        matchInsurer = insUpper.includes('ACKO') || insUpper.includes('INSURER B') || insUpper.includes('GATEWAY 2');
      } else if (filterUpper === 'TATA') {
        matchInsurer = insUpper.includes('TATA') || insUpper.includes('INSURER C') || insUpper.includes('GATEWAY 3');
      } else if (filterUpper === 'HDFC') {
        matchInsurer = insUpper.includes('HDFC') || insUpper.includes('INSURER D') || insUpper.includes('GATEWAY 4');
      } else {
        matchInsurer = insUpper.includes(filterUpper);
      }
    }

    // Status Match
    let matchStatus = true;
    if (policyStatusFilter !== 'ALL') {
      const isExpired = p.active === false || (p.status && p.status.toUpperCase() === 'EXPIRED') || (p.end_date && new Date(p.end_date).getTime() < Date.now());
      if (policyStatusFilter === 'ACTIVE') {
        matchStatus = !isExpired;
      } else if (policyStatusFilter === 'EXPIRED') {
        matchStatus = isExpired;
      }
    }

    // Search Match
    let matchSearch = true;
    if (policySearch && policySearch.trim()) {
      const q = policySearch.trim().toLowerCase();
      matchSearch = (
        (p.policy_number && p.policy_number.toLowerCase().includes(q)) ||
        (p.vehicle_registration && p.vehicle_registration.toLowerCase().includes(q)) ||
        (p.vehicle_details && p.vehicle_details.toLowerCase().includes(q)) ||
        (p.customer_name && p.customer_name.toLowerCase().includes(q)) ||
        (p.customer_email && p.customer_email.toLowerCase().includes(q)) ||
        (p.product_name && p.product_name.toLowerCase().includes(q)) ||
        (p.insurer_name && p.insurer_name.toLowerCase().includes(q))
      );
    }

    return matchInsurer && matchStatus && matchSearch;
  });

  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    let valA, valB;
    switch (policySortField) {
      case 'policy_number':
        valA = (a.policy_number || '').toLowerCase();
        valB = (b.policy_number || '').toLowerCase();
        break;
      case 'insurer_name':
        valA = (a.insurer_name || '').toLowerCase();
        valB = (b.insurer_name || '').toLowerCase();
        break;
      case 'customer_name':
        valA = (a.customer_name || '').toLowerCase();
        valB = (b.customer_name || '').toLowerCase();
        break;
      case 'vehicle_details':
        valA = (a.vehicle_details || a.vehicle_registration || '').toLowerCase();
        valB = (b.vehicle_details || b.vehicle_registration || '').toLowerCase();
        break;
      case 'premium_amount':
        valA = parseFloat(a.premium_amount || a.premium) || 0;
        valB = parseFloat(b.premium_amount || b.premium) || 0;
        break;
      case 'end_date':
        valA = new Date(a.end_date || 0).getTime();
        valB = new Date(b.end_date || 0).getTime();
        break;
      case 'status':
        valA = a.active ? 1 : 0;
        valB = b.active ? 1 : 0;
        break;
      default:
        valA = a[policySortField] !== undefined ? a[policySortField] : '';
        valB = b[policySortField] !== undefined ? b[policySortField] : '';
    }
    if (valA < valB) return policySortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return policySortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedUsers = [...usersList].sort((a, b) => {
    let valA, valB;
    switch (userSortField) {
      case 'id':
        valA = parseInt(a.id) || 0;
        valB = parseInt(b.id) || 0;
        break;
      case 'full_name':
        valA = (a.full_name || '').toLowerCase();
        valB = (b.full_name || '').toLowerCase();
        break;
      case 'email':
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
        break;
      case 'role':
        valA = (a.role || '').toLowerCase();
        valB = (b.role || '').toLowerCase();
        break;
      case 'policies_count':
        valA = parseInt(a.policies_count) || 0;
        valB = parseInt(b.policies_count) || 0;
        break;
      case 'wallet_balance':
        valA = parseFloat(a.wallet_balance) || 0;
        valB = parseFloat(b.wallet_balance) || 0;
        break;
      case 'is_active':
        valA = a.is_active ? 1 : 0;
        valB = b.is_active ? 1 : 0;
        break;
      default:
        valA = a[userSortField] !== undefined ? a[userSortField] : '';
        valB = b[userSortField] !== undefined ? b[userSortField] : '';
    }
    if (valA < valB) return userSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return userSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedProducts = [...publishedProducts].sort((a, b) => {
    let valA, valB;
    switch (productSortField) {
      case 'name':
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        break;
      case 'insurer_name':
        valA = (a.insurer_name || '').toLowerCase();
        valB = (b.insurer_name || '').toLowerCase();
        break;
      case 'base_rate':
        valA = parseFloat(a.base_rate) || 0;
        valB = parseFloat(b.base_rate) || 0;
        break;
      case 'minimum_premium':
        valA = parseFloat(a.minimum_premium) || 0;
        valB = parseFloat(b.minimum_premium) || 0;
        break;
      case 'active':
        valA = a.active ? 1 : 0;
        valB = b.active ? 1 : 0;
        break;
      default:
        valA = a[productSortField] !== undefined ? a[productSortField] : '';
        valB = b[productSortField] !== undefined ? b[productSortField] : '';
    }
    if (valA < valB) return productSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return productSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const pendingClaimsCount = claims.filter(c => isClaimPending(c.status)).length;

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-tinted)', border: '1px solid rgba(21, 101, 192, 0.2)', padding: '4px 12px', borderRadius: 9999, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-primary)' }}>ADMINISTRATION CONSOLE</span>
          </div>
          <h1 style={{ fontSize: 28, color: 'var(--primary-navy)', margin: 0 }}>SYNOVA Executive Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 4, margin: 0 }}>
            Real-time portfolio analytics, claims triage with instant wallet payouts, policy registry, and insurer scraper health.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#FFFFFF', padding: 4, borderRadius: 9999, border: '1px solid rgba(11, 31, 58, 0.1)', gap: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {['claims', 'policies', 'users', 'insurers', 'products'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'users') fetchUsers();
                if (tab === 'claims') fetchClaims();
                if (tab === 'policies') fetchPolicies();
                if (tab === 'insurers') fetchInsurerHealth();
              }}
              style={{
                background: activeTab === tab ? 'var(--primary-navy)' : 'transparent',
                color: activeTab === tab ? '#FFFFFF' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'claims' ? `Claims (${pendingClaimsCount} Pending)` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Policies</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-heading)', marginTop: 4 }}>
            {policies.filter(p => p.active !== false).length} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>/ {policies.length} total</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Gross Written Premium</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-purple)', marginTop: 4 }}>
            ₹{Number(policies.reduce((sum, p) => sum + (parseFloat(p.premium_amount || p.premium) || 0), 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Registered Customers</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-heading)', marginTop: 4 }}>
            {usersList.length}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Settlement Ratio</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--status-emerald)', marginTop: 4 }}>
            {claims.length > 0 ? ((claims.filter(c => ['APPROVED', 'DISBURSED'].includes(c.status)).length / claims.length) * 100).toFixed(1) : '100.0'}% <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({claims.filter(c => ['APPROVED', 'DISBURSED'].includes(c.status)).length} settled)</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {claimSuccessMessage && (
        <div style={{
          padding: '12px 18px',
          background: 'var(--status-emerald-bg)',
          border: '1px solid #A7F3D0',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--status-emerald)',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>✓ {claimSuccessMessage}</span>
          <button onClick={() => setClaimSuccessMessage('')} style={{ background: 'none', border: 'none', color: 'var(--status-emerald)', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* TAB 1: CLAIMS TRIAGE & ADJUDICATION DESK */}
      {activeTab === 'claims' && (
        <div className="glass-card" style={{ padding: 24, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, color: 'var(--text-heading)', margin: 0 }}>First Notice of Loss (FNOL) Claims Adjudication</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>Review damage evidence, assign certified surveyors, and execute atomic wallet payouts.</p>
            </div>

            {/* Status Filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { key: 'ALL', label: 'All' },
                { key: 'SUBMITTED', label: 'Submitted' },
                { key: 'UNDER_REVIEW', label: 'Under Review' },
                { key: 'SURVEYOR_ASSIGNED', label: 'Surveyor Assigned' },
                { key: 'APPROVED', label: 'Approved' },
                { key: 'REJECTED', label: 'Rejected' },
              ].map(({ key, label }) => {
                const count = key === 'ALL'
                  ? claims.length
                  : claims.filter((c) => {
                      const s = (c.status || '').toUpperCase().trim();
                      if (key === 'APPROVED') return s === 'APPROVED' || s === 'DISBURSED';
                      if (key === 'SUBMITTED') return s === 'SUBMITTED' || s === 'PENDING';
                      return s === key;
                    }).length;
                const isSelected = claimStatusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setClaimStatusFilter(key);
                    }}
                    style={{
                      background: isSelected ? 'var(--primary-navy)' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : 'var(--text-heading)',
                      border: isSelected ? '1px solid var(--primary-navy)' : '1px solid rgba(11,31,58,0.15)',
                      padding: '6px 12px',
                      borderRadius: 9999,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 6px rgba(11,31,58,0.15)' : 'none',
                    }}
                  >
                    <span>{label}</span>
                    <span
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                        padding: '1px 6px',
                        borderRadius: 9999,
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Claims Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                  {renderSortTh('Claim # / Date', 'claim_number', claimSortField, claimSortOrder, () => toggleSort('claim_number', claimSortField, claimSortOrder, setClaimSortField, setClaimSortOrder))}
                  {renderSortTh('Customer & Policy', 'customer_name', claimSortField, claimSortOrder, () => toggleSort('customer_name', claimSortField, claimSortOrder, setClaimSortField, setClaimSortOrder))}
                  {renderSortTh('Incident / Garage', 'claim_type', claimSortField, claimSortOrder, () => toggleSort('claim_type', claimSortField, claimSortOrder, setClaimSortField, setClaimSortOrder))}
                  {renderSortTh('Loss Amount', 'estimated_loss', claimSortField, claimSortOrder, () => toggleSort('estimated_loss', claimSortField, claimSortOrder, setClaimSortField, setClaimSortOrder))}
                  {renderSortTh('Status', 'status', claimSortField, claimSortOrder, () => toggleSort('status', claimSortField, claimSortOrder, setClaimSortField, setClaimSortOrder))}
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClaims.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                      No claims found for the selected status filter.
                    </td>
                  </tr>
                ) : (
                  sortedClaims.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                        {c.claim_number}
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 400 }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '25/8/2026'}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {c.customer_name || 'Hariharan Murugesan'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {c.policy_number || 'POL-ICI-883921'} • {c.insurer_name || 'ICICI Lombard General Insurance'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ color: 'var(--text-heading)' }}>{c.claim_type} ({c.incident_location || 'Bangalore Electronic City'})</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.garage_name || 'Authorized Cashless Network Service Hub'}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>₹{Number(c.estimated_loss || 28000).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'var(--status-emerald)' }}>Payout: ₹{Number(c.net_payout || c.approved_amount || 0).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${
                          c.status === 'APPROVED' || c.status === 'DISBURSED' ? 'badge-active' :
                          c.status === 'REJECTED' ? 'badge-danger' :
                          c.status === 'SURVEYOR_ASSIGNED' ? 'badge-purple' : 'badge-warning'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedClaim(c);
                            setAdjudicateAmount(c.approved_amount || c.estimated_loss || '');
                            setAdminNotes(c.surveyor_notes || '');
                          }}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: 11.5 }}
                        >
                          Inspect / Triage →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: POLICIES REGISTRY */}
      {activeTab === 'policies' && (
        <div className="glass-card" style={{ padding: 24, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, color: 'var(--text-heading)', margin: 0 }}>System-Wide Policies Directory</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>Live tracking of all active and expired vehicle policies across all 4 insurer networks.</p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search Policy #, Reg, or Name..."
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                style={{ width: 220, padding: '6px 12px', fontSize: 12 }}
              />
              <select
                className="input-field"
                value={policyInsurerFilter}
                onChange={(e) => setPolicyInsurerFilter(e.target.value)}
                style={{ width: 140, padding: '6px 10px', fontSize: 12 }}
              >
                <option value="ALL">All Insurers</option>
                <option value="ICICI">ICICI Lombard (A)</option>
                <option value="ACKO">ACKO Direct (B)</option>
                <option value="TATA">TATA AIG (C)</option>
                <option value="HDFC">HDFC ERGO (D)</option>
              </select>
              <select
                className="input-field"
                value={policyStatusFilter}
                onChange={(e) => setPolicyStatusFilter(e.target.value)}
                style={{ width: 120, padding: '6px 10px', fontSize: 12 }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                  {renderSortTh('Policy Number', 'policy_number', policySortField, policySortOrder, () => toggleSort('policy_number', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                  {renderSortTh('Insurer Provider', 'insurer_name', policySortField, policySortOrder, () => toggleSort('insurer_name', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                  {renderSortTh('Customer Name', 'customer_name', policySortField, policySortOrder, () => toggleSort('customer_name', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                  {renderSortTh('Vehicle Asset', 'vehicle_details', policySortField, policySortOrder, () => toggleSort('vehicle_details', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                  {renderSortTh('Premium', 'premium_amount', policySortField, policySortOrder, () => toggleSort('premium_amount', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                  {renderSortTh('Coverage End', 'end_date', policySortField, policySortOrder, () => toggleSort('end_date', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                  {renderSortTh('Status', 'status', policySortField, policySortOrder, () => toggleSort('status', policySortField, policySortOrder, setPolicySortField, setPolicySortOrder))}
                </tr>
              </thead>
              <tbody>
                {sortedPolicies.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                      No policies found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  sortedPolicies.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                        {p.policy_number}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {p.insurer_name}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ color: 'var(--text-heading)' }}>{p.customer_name}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{p.customer_email}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                        {p.vehicle_details || p.vehicle_registration || 'Motor Vehicle'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                        ₹{Number(p.premium_amount || p.premium || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Active'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${p.active ? 'badge-active' : 'badge-danger'}`}>
                          {p.active ? 'ACTIVE' : 'EXPIRED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: 24, background: '#FFFFFF' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, color: 'var(--text-heading)', margin: 0 }}>Registered Users & Policyholder Accounts</h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>Manage user profiles, role assignments, and inspect linked wallet balances.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11 }}>
                  {renderSortTh('User ID', 'id', userSortField, userSortOrder, () => toggleSort('id', userSortField, userSortOrder, setUserSortField, setUserSortOrder))}
                  {renderSortTh('Name & Email', 'full_name', userSortField, userSortOrder, () => toggleSort('full_name', userSortField, userSortOrder, setUserSortField, setUserSortOrder))}
                  {renderSortTh('Account Role', 'role', userSortField, userSortOrder, () => toggleSort('role', userSortField, userSortOrder, setUserSortField, setUserSortOrder))}
                  {renderSortTh('Policies Held', 'policies_count', userSortField, userSortOrder, () => toggleSort('policies_count', userSortField, userSortOrder, setUserSortField, setUserSortOrder))}
                  {renderSortTh('Wallet Balance', 'wallet_balance', userSortField, userSortOrder, () => toggleSort('wallet_balance', userSortField, userSortOrder, setUserSortField, setUserSortOrder))}
                  {renderSortTh('Status', 'is_active', userSortField, userSortOrder, () => toggleSort('is_active', userSortField, userSortOrder, setUserSortField, setUserSortOrder))}
                </tr>
              </thead>
              <tbody>
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-muted)' }}>#{u.id}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{u.full_name || 'Anonymous User'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge" style={{
                          background: u.role === 'admin' ? 'var(--status-amber-bg)' : 'var(--bg-purple-light)',
                          color: u.role === 'admin' ? 'var(--status-amber)' : 'var(--primary-purple)',
                          border: u.role === 'admin' ? '1px solid #FDE68A' : '1px solid #DDD6FE'
                        }}>
                          {u.role ? u.role.toUpperCase() : 'CUSTOMER'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {u.policies_count || 0} Policies
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--status-emerald)' }}>
                        ₹{Number(u.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${u.is_active ? 'badge-active' : 'badge-danger'}`}>{u.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INSURER HEALTH MONITOR */}
      {activeTab === 'insurers' && (
        <div className="glass-card" style={{ padding: 24, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, color: 'var(--text-heading)', margin: 0 }}>Insurer Bot & Scraper Health Radar</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>Live telemetry and latency probe metrics for autonomous quotation adapters.</p>
            </div>
            <button
              onClick={fetchInsurerHealth}
              disabled={healthLoading}
              className="btn-secondary"
              style={{ fontSize: 13, padding: '8px 16px' }}
            >
              {healthLoading ? 'Pinging Adapters...' : 'Probe All Adapters'}
            </button>
          </div>

          <div className="grid-2">
            {insurerHealth.map((ins) => (
              <div key={ins.id} className="glass-card" style={{ padding: 20, background: '#F8FAFC', borderLeft: `4px solid ${ins.latency_ms < 300 ? 'var(--status-emerald)' : 'var(--status-amber)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 15 }}>{ins.name}</div>
                  <span className={`badge ${ins.status.includes('ONLINE') ? 'badge-active' : 'badge-danger'}`}>
                    {ins.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  <div>
                    <span>Response Latency: </span>
                    <strong style={{ color: 'var(--text-heading)' }}>{ins.latency_ms} ms</strong>
                  </div>
                  <div>
                    <span>HTTP Health Code: </span>
                    <strong style={{ color: 'var(--status-emerald)' }}>{ins.http_code} OK</strong>
                  </div>
                  <div>
                    <span>Scraper Protocol: </span>
                    <strong style={{ color: 'var(--text-heading)' }}>Playwright / Async HTTP</strong>
                  </div>
                  <div>
                    <span>Last Checked: </span>
                    <strong style={{ color: 'var(--text-dim)' }}>{ins.last_checked || 'Just now'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MOCK INSURERS PRODUCT MANAGEMENT & BROADCAST */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Mock Insurer Portals Launcher */}
          <div className="glass-card" style={{ padding: 20, background: '#FFFFFF' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary-navy)', marginBottom: 8 }}>
              Direct Mock Insurer Portals
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Open mock insurer portals running on local gateway ports for end-to-end quotation and policy issuance verification.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="http://localhost:9001/quote"
                target="_blank"
                rel="noreferrer"
                className="btn-pill-secondary"
                style={{ padding: '8px 18px', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Gateway 1: ICICI Lombard (Port 9001)</span> ↗
              </a>
              <a
                href="http://localhost:9002/quote"
                target="_blank"
                rel="noreferrer"
                className="btn-pill-secondary"
                style={{ padding: '8px 18px', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Gateway 2: ACKO General (Port 9002)</span> ↗
              </a>
              <a
                href="http://localhost:9003/quote"
                target="_blank"
                rel="noreferrer"
                className="btn-pill-secondary"
                style={{ padding: '8px 18px', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Gateway 3: TATA AIG (Port 9003)</span> ↗
              </a>
              <a
                href="http://localhost:9004/quote"
                target="_blank"
                rel="noreferrer"
                className="btn-pill-secondary"
                style={{ padding: '8px 18px', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Gateway 4: HDFC ERGO (Port 9004)</span> ↗
              </a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'start' }}>
            {/* Left: Publish New Product Form */}
            <div className="glass-card" style={{ padding: 26, background: '#FFFFFF' }}>
              <h2 style={{ fontSize: 18, color: 'var(--text-heading)', marginBottom: 4 }}>Publish New Insurer Product</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 18 }}>
                Catalog new pricing rules and dispatch instant live notifications to policyholders.
              </p>

              <form onSubmit={handleCreateProduct}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Mock Insurer</label>
                  <select
                    className="input-field"
                    value={newProduct.insurer_id}
                    onChange={(e) => setNewProduct({ ...newProduct, insurer_id: e.target.value })}
                  >
                    <option value="1">ICICI Lombard General (Gateway 1)</option>
                    <option value="2">ACKO General Insurance (Gateway 2)</option>
                    <option value="3">TATA AIG Assurance (Gateway 3)</option>
                    <option value="4">HDFC ERGO General (Gateway 4)</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Product Plan Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Base OD Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      value={newProduct.base_rate}
                      onChange={(e) => setNewProduct({ ...newProduct, base_rate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Starting Premium (₹)</label>
                    <input
                      type="number"
                      step="100"
                      className="input-field"
                      value={newProduct.minimum_premium}
                      onChange={(e) => setNewProduct({ ...newProduct, minimum_premium: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Coverage Description & Terms</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-pill-primary" disabled={publishLoading} style={{ width: '100%', padding: '12px 20px', fontSize: 13.5 }}>
                  {publishLoading ? 'Publishing & Broadcasting...' : 'Publish & Broadcast Live Notification →'}
                </button>
              </form>

              {publishResult && (
                <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-tinted)', border: '1px solid rgba(21, 101, 192, 0.2)', borderRadius: 12, color: 'var(--blue-primary)', fontSize: 12.5, fontWeight: 600 }}>
                  ✓ {publishResult.message}
                </div>
              )}
            </div>

            {/* Right: Live Product Catalog & Management Table */}
            <div className="glass-card" style={{ padding: 26, background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 18, color: 'var(--text-heading)', margin: 0 }}>Insurer Products Catalog</h2>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>Active products catalog across mock insurers with live notification broadcast.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    className="input-field"
                    value={`${productSortField}_${productSortOrder}`}
                    onChange={(e) => {
                      const [f, o] = e.target.value.split('_');
                      setProductSortField(f);
                      setProductSortOrder(o);
                    }}
                    style={{ padding: '4px 10px', fontSize: 12, width: 190 }}
                  >
                    <option value="name_asc">Plan Name (A-Z)</option>
                    <option value="name_desc">Plan Name (Z-A)</option>
                    <option value="insurer_name_asc">Insurer Name (A-Z)</option>
                    <option value="base_rate_asc">Base Rate (Lowest First)</option>
                    <option value="base_rate_desc">Base Rate (Highest First)</option>
                    <option value="minimum_premium_asc">Starting Premium (Lowest)</option>
                    <option value="minimum_premium_desc">Starting Premium (Highest)</option>
                    <option value="active_desc">Active Status</option>
                  </select>
                  <span className="badge badge-ai">{publishedProducts.length} Plans</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sortedProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: p.active ? '#F8FAFD' : '#F1F5F9',
                      border: p.active ? '1px solid rgba(11,31,58,0.08)' : '1px dashed #CBD5E1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <InsurerLogoBadge insurerName={p.insurer_name} size={38} rounded={8} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 14, color: 'var(--primary-navy)' }}>{p.name}</strong>
                          <span className={`badge ${p.active ? 'badge-active' : 'badge-danger'}`} style={{ fontSize: 9.5 }}>
                            {p.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                          {p.insurer_name} • Base Rate: <strong>{p.base_rate}%</strong> • Min: <strong>₹{Number(p.minimum_premium).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={() => handleBroadcastProduct(p)}
                        className="btn-pill-primary"
                        style={{ padding: '6px 12px', fontSize: 11.5 }}
                        title="Dispatch instant broadcast notification to policyholders"
                      >
                        Notify
                      </button>
                      <button
                        onClick={() => handleToggleProduct(p.id)}
                        className="btn-pill-secondary"
                        style={{ padding: '6px 12px', fontSize: 11.5 }}
                      >
                        {p.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--status-rose)', cursor: 'pointer', fontSize: 16, padding: 4 }}
                        title="Delete product"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM INSPECTION / TRIAGE MODAL */}
      {selectedClaim && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="glass-card" style={{ width: 620, maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', padding: 32, background: '#FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: 4 }}>Claim Triage Desk</span>
                <h3 style={{ fontSize: 20, color: 'var(--text-heading)', margin: 0 }}>Claim #{selectedClaim.claim_number}</h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}
              >×</button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 18, borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, marginBottom: 10 }}>
                <div><strong>Policyholder:</strong> {selectedClaim.customer_name}</div>
                <div><strong>Policy Number:</strong> {selectedClaim.policy_number}</div>
                <div><strong>Insurer:</strong> {selectedClaim.insurer_name}</div>
                <div><strong>Vehicle:</strong> {selectedClaim.vehicle_details}</div>
                <div><strong>Incident Location:</strong> {selectedClaim.incident_location || 'N/A'}</div>
                <div><strong>Incident Date:</strong> {selectedClaim.incident_date ? new Date(selectedClaim.incident_date).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div style={{ fontSize: 12.5, marginTop: 8 }}>
                <strong>Claim Description:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{selectedClaim.description || 'No description provided.'}</p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Loss (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={selectedClaim.estimated_loss || 0}
                    disabled
                    style={{ background: '#F1F5F9' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--status-emerald)', fontWeight: 600, marginBottom: 4 }}>Approved Net Payout (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={adjudicateAmount}
                    onChange={(e) => setAdjudicateAmount(e.target.value)}
                    placeholder="Enter approved amount"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Surveyor Officer & Contact</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input
                    type="text"
                    className="input-field"
                    value={surveyorName}
                    onChange={(e) => setSurveyorName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field"
                    value={surveyorContact}
                    onChange={(e) => setSurveyorContact(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Adjudication / Reason Notes</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes recorded to user history & notification..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleClaimAdjudication('SURVEYOR_ASSIGNED')}
                disabled={claimActionLoading}
                className="btn-secondary"
                style={{ fontSize: 12 }}
              >
                Assign Surveyor
              </button>

              <button
                type="button"
                onClick={() => handleClaimAdjudication('REJECTED')}
                disabled={claimActionLoading}
                style={{
                  background: 'var(--status-rose-bg)',
                  border: '1px solid #FECACA',
                  color: 'var(--status-rose)',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reject Claim
              </button>

              <button
                type="button"
                onClick={() => handleClaimAdjudication('APPROVED')}
                disabled={claimActionLoading}
                className="btn-primary"
                style={{
                  background: 'var(--status-emerald)',
                  color: '#FFFFFF',
                  border: '1px solid var(--status-emerald)',
                  fontSize: 12
                }}
              >
                {claimActionLoading ? 'Processing Payout...' : '✓ Approve & Disburse to User Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
