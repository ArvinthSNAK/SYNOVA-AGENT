import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Bell,
  Lock,
  Car,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Key,
  Smartphone,
  Check,
  Building2,
  Calendar,
  HeartHandshake,
  Layers,
  ChevronRight,
  ShieldCheck,
  Laptop,
  CheckCircle,
} from 'lucide-react';
import UserNavbar from '../components/layout/UserNavbar.jsx';
import EulerLauncher from '../features/dashboard/components/EulerLauncher.jsx';
import { useUser } from '../context/UserContext.jsx';
import './SettingsPage.css';

const AVATAR_COLORS = [
  { name: 'Synova Emerald', value: '#0F6E6E' },
  { name: 'Deep Teal', value: '#084C61' },
  { name: 'Royal Indigo', value: '#3B49DF' },
  { name: 'Electric Violet', value: '#6D28D9' },
  { name: 'Warm Terracotta', value: '#D06A4E' },
  { name: 'Ocean Cyan', value: '#0284C7' },
];

const INSURER_OPTIONS = [
  'ICICI Lombard',
  'HDFC ERGO',
  'Bajaj Allianz',
  'ACKO General Insurance',
  'Tata AIG',
  'Go Digit',
  'SBI General',
];

const COVERAGE_TYPES = [
  'Comprehensive + Zero Depreciation',
  'Comprehensive Standard',
  'Third-Party Only',
  'Own Damage Only',
];

export default function SettingsPage() {
  const { user, updateUser, resetUser, toast, triggerToast } = useUser();
  const [activeTab, setActiveTab] = useState('personal');

  // Form State initialized from user context
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob || '1992-07-18',
    gender: user.gender || 'Male',
    avatarColor: user.avatarColor || '#0F6E6E',
    bio: user.bio || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      pinCode: user.address?.pinCode || '',
      country: user.address?.country || 'India',
    },
    emergencyContact: {
      name: user.emergencyContact?.name || '',
      relationship: user.emergencyContact?.relationship || '',
      phone: user.emergencyContact?.phone || '',
    },
    vehiclePreferences: {
      defaultVehicle: user.vehiclePreferences?.defaultVehicle || '',
      preferredInsurer: user.vehiclePreferences?.preferredInsurer || 'ICICI Lombard',
      preferredCoverage: user.vehiclePreferences?.preferredCoverage || 'Comprehensive + Zero Depreciation',
      fuelType: user.vehiclePreferences?.fuelType || 'Petrol',
    },
    notifications: {
      emailAlerts: user.notifications?.emailAlerts ?? true,
      smsAlerts: user.notifications?.smsAlerts ?? true,
      whatsappAlerts: user.notifications?.whatsappAlerts ?? true,
      renewalReminders: user.notifications?.renewalReminders ?? true,
      promotionalOffers: user.notifications?.promotionalOffers ?? false,
      instantEulerTips: user.notifications?.instantEulerTips ?? true,
    },
    security: {
      twoFactorEnabled: user.security?.twoFactorEnabled ?? true,
    },
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync from context when user changes externally
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dob: user.dob || '1992-07-18',
      gender: user.gender || 'Male',
      avatarColor: user.avatarColor || '#0F6E6E',
      bio: user.bio || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pinCode: user.address?.pinCode || '',
        country: user.address?.country || 'India',
      },
      emergencyContact: {
        name: user.emergencyContact?.name || '',
        relationship: user.emergencyContact?.relationship || '',
        phone: user.emergencyContact?.phone || '',
      },
      vehiclePreferences: {
        defaultVehicle: user.vehiclePreferences?.defaultVehicle || '',
        preferredInsurer: user.vehiclePreferences?.preferredInsurer || 'ICICI Lombard',
        preferredCoverage: user.vehiclePreferences?.preferredCoverage || 'Comprehensive + Zero Depreciation',
        fuelType: user.vehiclePreferences?.fuelType || 'Petrol',
      },
      notifications: {
        emailAlerts: user.notifications?.emailAlerts ?? true,
        smsAlerts: user.notifications?.smsAlerts ?? true,
        whatsappAlerts: user.notifications?.whatsappAlerts ?? true,
        renewalReminders: user.notifications?.renewalReminders ?? true,
        promotionalOffers: user.notifications?.promotionalOffers ?? false,
        instantEulerTips: user.notifications?.instantEulerTips ?? true,
      },
      security: {
        twoFactorEnabled: user.security?.twoFactorEnabled ?? true,
      },
    }));
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleNotificationToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setIsDirty(true);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      // Auto-extract first name if name is empty
      const displayNick = formData.name.trim() || formData.fullName.split(' ')[0] || 'User';
      const updated = {
        ...formData,
        name: displayNick,
      };
      updateUser(updated);
      setIsSaving(false);
      setIsDirty(false);
      triggerToast('Profile & preferences updated successfully!');
    }, 450);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default values?')) {
      resetUser();
      setIsDirty(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSuccess(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    triggerToast('Password updated securely!', 'success');
  };

  // Quick password strength calc
  const getPasswordStrength = () => {
    const p = passwordForm.newPassword;
    if (!p) return { level: 0, text: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, text: 'Weak', color: '#EF4444' };
    if (score === 2 || score === 3) return { level: 2, text: 'Good', color: '#F59E0B' };
    return { level: 3, text: 'Strong', color: '#10B981' };
  };

  const strength = getPasswordStrength();

  const tabs = [
    { id: 'personal', label: 'Personal Profile', icon: User },
    { id: 'address', label: 'Address & Emergency', icon: MapPin },
    { id: 'preferences', label: 'Vehicle & Policies', icon: Car },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Login', icon: Lock },
  ];

  return (
    <div className="dashboard-layout mesh-ambient-bg">
      <UserNavbar />

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`settings-toast ${toast.type === 'info' ? 'settings-toast--info' : 'settings-toast--success'}`}
          >
            <CheckCircle2 size={18} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="settings-content" id="main-content" tabIndex={-1}>
        {/* Header Title Section */}
        <div className="settings-page-header">
          <div>
            <div className="settings-header-badge">
              <ShieldCheck size={14} className="settings-shield-icon" />
              <span>Verified Account Settings</span>
            </div>
            <h1 className="settings-title">Account & Profile Settings</h1>
            <p className="settings-subtitle">
              Manage your personal identity, contact details, policy defaults, and security configurations.
            </p>
          </div>

          <div className="settings-header-actions">
            {isDirty && (
              <span className="settings-unsaved-badge">
                <span className="settings-pulse-dot" />
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="settings-btn-secondary"
              title="Reset to default mock data"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="settings-btn-primary"
            >
              {isSaving ? (
                <>
                  <div className="settings-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Card Banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="settings-profile-banner glass-card"
        >
          <div className="settings-avatar-wrap">
            <div
              className="settings-avatar-large"
              style={{ backgroundColor: formData.avatarColor }}
            >
              {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="settings-avatar-color-picker">
              <span className="settings-color-label">Theme Color:</span>
              <div className="settings-color-dots">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    aria-label={`Select ${c.name} theme`}
                    onClick={() => handleChange('avatarColor', c.value)}
                    className={`settings-color-dot ${formData.avatarColor === c.value ? 'settings-color-dot--active' : ''}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="settings-profile-info">
            <div className="settings-profile-name-row">
              <h2>{formData.fullName || 'Naresh Kumar'}</h2>
              <span className="settings-verified-pill">
                <CheckCircle2 size={13} /> Policyholder
              </span>
            </div>
            <p className="settings-profile-sub">
              {formData.email} · {formData.phone}
            </p>
            <div className="settings-profile-meta-tags">
              <span className="settings-meta-tag">
                <Calendar size={13} /> Member since {user.customerSince || 'Apr 2023'}
              </span>
              <span className="settings-meta-tag mono">
                ID: {user.id || 'USR-001'}
              </span>
              <span className="settings-meta-tag">
                <Car size={13} /> {formData.vehiclePreferences.defaultVehicle.split(' ')[0] || 'KA-01'}
              </span>
            </div>
          </div>

          <div className="settings-completion-card">
            <div className="settings-completion-head">
              <span>Profile Health</span>
              <span className="settings-completion-pct">100%</span>
            </div>
            <div className="settings-completion-bar">
              <div className="settings-completion-fill" style={{ width: '100%' }} />
            </div>
            <p className="settings-completion-tip">
              <Sparkles size={13} /> Ready for instant zero-touch claims & quotes.
            </p>
          </div>
        </motion.div>

        {/* Main Settings Grid Layout: Tabs + Content */}
        <div className="settings-layout-grid">
          {/* Sidebar Nav */}
          <nav className="settings-tabs-nav glass-card" aria-label="Settings Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-tab-btn ${isActive ? 'settings-tab-btn--active' : ''}`}
                >
                  <Icon size={18} className="settings-tab-icon" />
                  <span className="settings-tab-label">{tab.label}</span>
                  {isActive && <ChevronRight size={15} className="settings-tab-arrow" />}
                </button>
              );
            })}
          </nav>

          {/* Form Content Panel */}
          <div className="settings-form-panel glass-card">
            {/* Tab 1: Personal Profile */}
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="settings-section"
              >
                <div className="settings-section-head">
                  <h2 className="settings-section-title">Personal Information</h2>
                  <p className="settings-section-desc">
                    Your official identity as registered on insurance policies and KYC documents.
                  </p>
                </div>

                <div className="settings-inputs-grid">
                  <div className="settings-field">
                    <label htmlFor="settings-fullName" className="settings-label">
                      Full Legal Name <span className="settings-required">*</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <User size={16} className="settings-input-icon" />
                      <input
                        id="settings-fullName"
                        type="text"
                        className="settings-input"
                        placeholder="e.g. Naresh Kumar"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        required
                      />
                    </div>
                    <span className="settings-hint">Must match your Government ID (Aadhaar/PAN).</span>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-displayName" className="settings-label">
                      Preferred Display Name (Nickname)
                    </label>
                    <div className="settings-input-wrapper">
                      <User size={16} className="settings-input-icon" />
                      <input
                        id="settings-displayName"
                        type="text"
                        className="settings-input"
                        placeholder="e.g. Naresh"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <span className="settings-hint">Displayed in greetings, Euler chat, and top navigation.</span>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-email" className="settings-label">
                      Email Address <span className="settings-required">*</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <Mail size={16} className="settings-input-icon" />
                      <input
                        id="settings-email"
                        type="email"
                        className="settings-input"
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                      <span className="settings-input-status-badge">
                        <Check size={12} /> Verified
                      </span>
                    </div>
                    <span className="settings-hint">Used for policy certificates, invoices, and renewal alerts.</span>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-phone" className="settings-label">
                      Phone Number <span className="settings-required">*</span>
                    </label>
                    <div className="settings-input-wrapper">
                      <Phone size={16} className="settings-input-icon" />
                      <input
                        id="settings-phone"
                        type="tel"
                        className="settings-input"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                      />
                      <span className="settings-input-status-badge">
                        <Check size={12} /> OTP Verified
                      </span>
                    </div>
                    <span className="settings-hint">Used for 2FA and WhatsApp policy renewal links.</span>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-dob" className="settings-label">
                      Date of Birth
                    </label>
                    <div className="settings-input-wrapper">
                      <Calendar size={16} className="settings-input-icon" />
                      <input
                        id="settings-dob"
                        type="date"
                        className="settings-input"
                        value={formData.dob}
                        onChange={(e) => handleChange('dob', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-gender" className="settings-label">
                      Gender
                    </label>
                    <div className="settings-input-wrapper">
                      <select
                        id="settings-gender"
                        className="settings-select"
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="settings-field settings-field--full">
                    <label htmlFor="settings-bio" className="settings-label">
                      Policyholder Bio / Notes
                    </label>
                    <textarea
                      id="settings-bio"
                      rows={3}
                      className="settings-textarea"
                      placeholder="Brief note or driving preferences..."
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Address & Emergency Contact */}
            {activeTab === 'address' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="settings-section"
              >
                <div className="settings-section-head">
                  <h2 className="settings-section-title">Address & Emergency Contact</h2>
                  <p className="settings-section-desc">
                    Address on file for vehicle registration, road tax jurisdiction, and emergency claims dispatch.
                  </p>
                </div>

                <h3 className="settings-subsection-title">
                  <MapPin size={16} /> Residential Address
                </h3>
                <div className="settings-inputs-grid">
                  <div className="settings-field settings-field--full">
                    <label htmlFor="settings-street" className="settings-label">
                      Street Address & Apartment
                    </label>
                    <div className="settings-input-wrapper">
                      <Building2 size={16} className="settings-input-icon" />
                      <input
                        id="settings-street"
                        type="text"
                        className="settings-input"
                        placeholder="House / Flat No., Street, Landmark"
                        value={formData.address.street}
                        onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-city" className="settings-label">City</label>
                    <input
                      id="settings-city"
                      type="text"
                      className="settings-input"
                      placeholder="Bengaluru"
                      value={formData.address.city}
                      onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-state" className="settings-label">State</label>
                    <input
                      id="settings-state"
                      type="text"
                      className="settings-input"
                      placeholder="Karnataka"
                      value={formData.address.state}
                      onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-pincode" className="settings-label">PIN Code</label>
                    <input
                      id="settings-pincode"
                      type="text"
                      className="settings-input mono"
                      placeholder="560066"
                      value={formData.address.pinCode}
                      onChange={(e) => handleNestedChange('address', 'pinCode', e.target.value)}
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-country" className="settings-label">Country</label>
                    <input
                      id="settings-country"
                      type="text"
                      className="settings-input"
                      placeholder="India"
                      value={formData.address.country}
                      onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                    />
                  </div>
                </div>

                <div className="settings-divider" />

                <h3 className="settings-subsection-title">
                  <HeartHandshake size={16} /> Emergency Roadside Contact
                </h3>
                <p className="settings-section-desc" style={{ marginBottom: 16 }}>
                  Contact person authorized to assist during critical accident claims or roadside breakdowns.
                </p>

                <div className="settings-inputs-grid">
                  <div className="settings-field">
                    <label htmlFor="settings-emergency-name" className="settings-label">Contact Name</label>
                    <div className="settings-input-wrapper">
                      <User size={16} className="settings-input-icon" />
                      <input
                        id="settings-emergency-name"
                        type="text"
                        className="settings-input"
                        placeholder="e.g. Priya Kumar"
                        value={formData.emergencyContact.name}
                        onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-emergency-rel" className="settings-label">Relationship</label>
                    <input
                      id="settings-emergency-rel"
                      type="text"
                      className="settings-input"
                      placeholder="e.g. Spouse, Parent, Sibling"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleNestedChange('emergencyContact', 'relationship', e.target.value)}
                    />
                  </div>

                  <div className="settings-field settings-field--full">
                    <label htmlFor="settings-emergency-phone" className="settings-label">Emergency Phone Number</label>
                    <div className="settings-input-wrapper">
                      <Phone size={16} className="settings-input-icon" />
                      <input
                        id="settings-emergency-phone"
                        type="tel"
                        className="settings-input"
                        placeholder="+91 98765 12345"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Vehicle & Policy Defaults */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="settings-section"
              >
                <div className="settings-section-head">
                  <h2 className="settings-section-title">Vehicle & Insurance Preferences</h2>
                  <p className="settings-section-desc">
                    Customize your default vehicle profile, favorite carriers, and automated renewal quote targets.
                  </p>
                </div>

                <div className="settings-inputs-grid">
                  <div className="settings-field settings-field--full">
                    <label htmlFor="settings-default-veh" className="settings-label">
                      Primary Vehicle Identifier
                    </label>
                    <div className="settings-input-wrapper">
                      <Car size={16} className="settings-input-icon" />
                      <input
                        id="settings-default-veh"
                        type="text"
                        className="settings-input"
                        placeholder="KA-01-XX-0000 (Hyundai Creta)"
                        value={formData.vehiclePreferences.defaultVehicle}
                        onChange={(e) => handleNestedChange('vehiclePreferences', 'defaultVehicle', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-pref-insurer" className="settings-label">
                      Preferred Insurance Carrier
                    </label>
                    <div className="settings-input-wrapper">
                      <select
                        id="settings-pref-insurer"
                        className="settings-select"
                        value={formData.vehiclePreferences.preferredInsurer}
                        onChange={(e) => handleNestedChange('vehiclePreferences', 'preferredInsurer', e.target.value)}
                      >
                        {INSURER_OPTIONS.map((ins) => (
                          <option key={ins} value={ins}>{ins}</option>
                        ))}
                      </select>
                    </div>
                    <span className="settings-hint">Carrier prioritized in fast one-click renewals.</span>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-pref-cov" className="settings-label">
                      Standard Coverage Tier
                    </label>
                    <div className="settings-input-wrapper">
                      <select
                        id="settings-pref-cov"
                        className="settings-select"
                        value={formData.vehiclePreferences.preferredCoverage}
                        onChange={(e) => handleNestedChange('vehiclePreferences', 'preferredCoverage', e.target.value)}
                      >
                        {COVERAGE_TYPES.map((cov) => (
                          <option key={cov} value={cov}>{cov}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="settings-fuel" className="settings-label">Fuel Type</label>
                    <div className="settings-input-wrapper">
                      <select
                        id="settings-fuel"
                        className="settings-select"
                        value={formData.vehiclePreferences.fuelType}
                        onChange={(e) => handleNestedChange('vehiclePreferences', 'fuelType', e.target.value)}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric (EV)">Electric (EV)</option>
                        <option value="CNG / Hybrid">CNG / Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 4: Notification Preferences */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="settings-section"
              >
                <div className="settings-section-head">
                  <h2 className="settings-section-title">Notification & Alert Channels</h2>
                  <p className="settings-section-desc">
                    Choose how Synova and Euler notify you regarding expiring policies, premium rate drops, and claims.
                  </p>
                </div>

                <div className="settings-toggles-list">
                  {[
                    {
                      key: 'renewalReminders',
                      title: 'Policy Expiry & Renewal Reminders',
                      desc: 'Timely reminders 30 days, 15 days, and 3 days before your policy lapses.',
                      badge: 'High Priority',
                    },
                    {
                      key: 'whatsappAlerts',
                      title: 'Instant WhatsApp Updates & Fast Renewal Links',
                      desc: 'Receive digital policy cards and one-tap renewal links directly on WhatsApp.',
                      badge: 'Recommended',
                    },
                    {
                      key: 'instantEulerTips',
                      title: 'Euler AI Policy Insights & Premium Optimization',
                      desc: 'Proactive AI suggestions when lower premium quotes or better NCB transfers become available.',
                      badge: 'AI Powered',
                    },
                    {
                      key: 'emailAlerts',
                      title: 'Email Summary & Tax Invoices',
                      desc: 'Digital receipts, 80D tax deductions, and policy endorsements sent to your inbox.',
                      badge: null,
                    },
                    {
                      key: 'smsAlerts',
                      title: 'Critical SMS Alerts',
                      desc: 'Emergency claim tracking, RSA dispatch updates, and OTP verification codes.',
                      badge: null,
                    },
                    {
                      key: 'promotionalOffers',
                      title: 'Partner Discounts & Roadside Add-on Offers',
                      desc: 'Exclusive discounts on dashcams, fast-tags, and ceramic coating partnerships.',
                      badge: null,
                    },
                  ].map((item) => (
                    <div key={item.key} className="settings-toggle-row">
                      <div className="settings-toggle-text">
                        <div className="settings-toggle-title-row">
                          <span className="settings-toggle-title">{item.title}</span>
                          {item.badge && (
                            <span className="settings-toggle-badge">{item.badge}</span>
                          )}
                        </div>
                        <p className="settings-toggle-desc">{item.desc}</p>
                      </div>
                      <label className="settings-switch">
                        <input
                          type="checkbox"
                          checked={formData.notifications[item.key]}
                          onChange={() => handleNotificationToggle(item.key)}
                        />
                        <span className="settings-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tab 5: Security & Login */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="settings-section"
              >
                <div className="settings-section-head">
                  <h2 className="settings-section-title">Security & Credentials</h2>
                  <p className="settings-section-desc">
                    Protect your insurance vault with multi-factor authentication and encrypted credentials.
                  </p>
                </div>

                {/* 2FA Card */}
                <div className="settings-2fa-card glass-panel">
                  <div className="settings-2fa-icon">
                    <Smartphone size={22} />
                  </div>
                  <div className="settings-2fa-text">
                    <h3>Two-Factor Authentication (2FA)</h3>
                    <p>
                      Require an OTP sent to your registered mobile number ({formData.phone}) when signing in from unknown devices.
                    </p>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={formData.security.twoFactorEnabled}
                      onChange={() => handleNestedChange('security', 'twoFactorEnabled', !formData.security.twoFactorEnabled)}
                    />
                    <span className="settings-slider" />
                  </label>
                </div>

                <div className="settings-divider" />

                {/* Change Password Form */}
                <h3 className="settings-subsection-title">
                  <Key size={16} /> Change Vault Password
                </h3>
                <p className="settings-section-desc" style={{ marginBottom: 16 }}>
                  Last updated on {user.security?.lastPasswordChange || '12 May 2026'}.
                </p>

                <form onSubmit={handlePasswordSubmit} className="settings-password-form">
                  {passwordError && (
                    <div className="settings-alert settings-alert--error">
                      <AlertCircle size={16} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="settings-alert settings-alert--success">
                      <CheckCircle size={16} />
                      <span>Password successfully changed and encrypted.</span>
                    </div>
                  )}

                  <div className="settings-inputs-grid">
                    <div className="settings-field settings-field--full">
                      <label htmlFor="settings-current-pass" className="settings-label">
                        Current Password
                      </label>
                      <div className="settings-input-wrapper">
                        <Lock size={16} className="settings-input-icon" />
                        <input
                          id="settings-current-pass"
                          type="password"
                          className="settings-input"
                          placeholder="••••••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="settings-field">
                      <label htmlFor="settings-new-pass" className="settings-label">
                        New Password
                      </label>
                      <div className="settings-input-wrapper">
                        <Lock size={16} className="settings-input-icon" />
                        <input
                          id="settings-new-pass"
                          type="password"
                          className="settings-input"
                          placeholder="Min 8 characters"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      {passwordForm.newPassword && (
                        <div className="settings-pwd-strength">
                          <div className="settings-strength-bars">
                            <span className={`settings-strength-bar ${strength.level >= 1 ? 'settings-strength-bar--filled' : ''}`} style={{ backgroundColor: strength.level >= 1 ? strength.color : '' }} />
                            <span className={`settings-strength-bar ${strength.level >= 2 ? 'settings-strength-bar--filled' : ''}`} style={{ backgroundColor: strength.level >= 2 ? strength.color : '' }} />
                            <span className={`settings-strength-bar ${strength.level >= 3 ? 'settings-strength-bar--filled' : ''}`} style={{ backgroundColor: strength.level >= 3 ? strength.color : '' }} />
                          </div>
                          <span className="settings-strength-text" style={{ color: strength.color }}>{strength.text}</span>
                        </div>
                      )}
                    </div>

                    <div className="settings-field">
                      <label htmlFor="settings-confirm-pass" className="settings-label">
                        Confirm New Password
                      </label>
                      <div className="settings-input-wrapper">
                        <Lock size={16} className="settings-input-icon" />
                        <input
                          id="settings-confirm-pass"
                          type="password"
                          className="settings-input"
                          placeholder="Repeat new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="settings-pwd-action">
                    <button type="submit" className="settings-btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="settings-divider" />

                {/* Active Sessions */}
                <h3 className="settings-subsection-title">
                  <Laptop size={16} /> Active Logged-in Devices
                </h3>
                <div className="settings-devices-list">
                  <div className="settings-device-row">
                    <div className="settings-device-icon">
                      <Laptop size={18} />
                    </div>
                    <div className="settings-device-info">
                      <div className="settings-device-name">
                        Chrome on Windows (Current Session)
                      </div>
                      <div className="settings-device-meta">
                        Bengaluru, India · Active right now
                      </div>
                    </div>
                    <span className="settings-device-current-badge">This Device</span>
                  </div>

                  <div className="settings-device-row">
                    <div className="settings-device-icon">
                      <Smartphone size={18} />
                    </div>
                    <div className="settings-device-info">
                      <div className="settings-device-name">
                        Synova Mobile App — Apple iPhone 15 Pro
                      </div>
                      <div className="settings-device-meta">
                        Bengaluru, India · Last active 3 hours ago
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast('Remote session logged out safely.', 'info')}
                      className="settings-device-revoke-btn"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bottom Save Bar inside Form Panel */}
            <div className="settings-bottom-actions">
              <div className="settings-bottom-status">
                {isDirty ? (
                  <span className="settings-bottom-dirty">
                    <AlertCircle size={14} /> You have unsaved changes in this tab.
                  </span>
                ) : (
                  <span className="settings-bottom-saved">
                    <CheckCircle2 size={14} /> All preferences are up-to-date.
                  </span>
                )}
              </div>
              <div className="settings-bottom-btns">
                <button
                  type="button"
                  onClick={handleReset}
                  className="settings-btn-secondary"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="settings-btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EulerLauncher />
    </div>
  );
}
