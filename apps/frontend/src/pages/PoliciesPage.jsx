import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Car, Motorbike, ArrowRight } from 'lucide-react';
import UserNavbar from '../components/layout/UserNavbar.jsx';
import EulerLauncher from '../features/dashboard/components/EulerLauncher.jsx';
import './PoliciesPage.css';

const EXAMPLE_POLICIES = [
  {
    vehicleType: 'four-wheeler',
    make: 'Hyundai',
    model: 'Creta',
    variant: 'SX(O) Turbo',
    coverageType: 'Comprehensive',
    provider: 'ICICI Lombard',
    premium: 18450,
    idv: 840000,
    badge: 'Most Popular · SUV',
  },
  {
    vehicleType: 'four-wheeler',
    make: 'Maruti Suzuki',
    model: 'Swift',
    variant: 'ZXi+',
    coverageType: 'Comprehensive',
    provider: 'ACKO',
    premium: 14200,
    idv: 620000,
    badge: 'Best Value · Hatchback',
  },
  {
    vehicleType: 'two-wheeler',
    make: 'Royal Enfield',
    model: 'Classic 350',
    variant: 'Halcyon',
    coverageType: 'Comprehensive',
    provider: 'Bajaj Allianz',
    premium: 7150,
    idv: 168000,
    badge: 'Popular · Cruiser',
  },
  {
    vehicleType: 'two-wheeler',
    make: 'Honda',
    model: 'Activa 6G',
    variant: 'DLX',
    coverageType: 'Comprehensive',
    provider: 'HDFC ERGO',
    premium: 2650,
    idv: 62000,
    badge: 'Best Value · Scooter',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function PoliciesPage() {
  return (
    <div className="dashboard-layout mesh-ambient-bg">
      <UserNavbar />

      <main className="policies-content" id="main-content" tabIndex={-1}>
        <div className="policies-header">
          <div className="policies-header-top">
            <div className="policies-icon-wrap" aria-hidden="true">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="policies-title">Your Insurance Policies</h1>
              <p className="policies-subtitle">
                Example coverage across two-wheelers and four-wheelers — see what a Synova-matched policy looks like.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="policy-example-grid"
        >
          {EXAMPLE_POLICIES.map((p) => {
            const VehicleIcon = p.vehicleType === 'two-wheeler' ? Motorbike : Car;
            return (
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="policy-example-card glass-card-interactive"
                key={`${p.make}-${p.model}`}
              >
                <div className="policy-example-top">
                  <div className="policy-example-icon">
                    <VehicleIcon size={20} />
                  </div>
                  <span className="policy-example-badge">{p.badge}</span>
                </div>
                <h3>{p.make} {p.model}</h3>
                <p className="policy-example-variant">{p.variant} · {p.coverageType}</p>
                <div className="policy-example-meta">
                  <div>
                    <span className="policy-example-meta-label">Provider</span>
                    <span className="policy-example-meta-value">{p.provider}</span>
                  </div>
                  <div>
                    <span className="policy-example-meta-label">IDV</span>
                    <span className="policy-example-meta-value">₹{Math.round(p.idv / 1000)}K</span>
                  </div>
                </div>
                <div className="policy-example-premium">
                  <span className="policy-example-premium-value">₹{p.premium.toLocaleString('en-IN')}</span>
                  <span className="policy-example-premium-unit">/year</span>
                </div>
                <Link to="/new-insurance" className="policy-example-cta">
                  Get a quote like this <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      <EulerLauncher />
    </div>
  );
}
