import React, { createContext, useContext, useState, useEffect } from 'react';
import { dashboardData } from '../features/dashboard/data/dashboardData.js';

const defaultUserData = {
  ...dashboardData.user,
  fullName: dashboardData.user.fullName || 'Naresh Kumar',
  name: dashboardData.user.name || 'Naresh',
  email: dashboardData.user.email || 'naresh.kumar@email.com',
  phone: dashboardData.user.phone || '+91 98765 43210',
  dob: '1992-07-18',
  gender: 'Male',
  avatarColor: '#0F6E6E',
  accountTier: 'Verified Policyholder',
  customerSince: '2023-04-12',
  id: 'USR-001',
  role: 'Customer',
  bio: 'Automobile enthusiast & comprehensive auto insurance policyholder.',
  address: {
    street: '42, Palm Meadows Boulevard, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560066',
    country: 'India',
  },
  emergencyContact: {
    name: 'Priya Kumar',
    relationship: 'Spouse',
    phone: '+91 98765 12345',
  },
  vehiclePreferences: {
    defaultVehicle: 'KA-01-XX-0000 (Hyundai Creta SX(O))',
    preferredInsurer: 'ICICI Lombard',
    preferredCoverage: 'Comprehensive + Zero Depreciation',
    fuelType: 'Petrol',
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    whatsappAlerts: true,
    renewalReminders: true,
    promotionalOffers: false,
    instantEulerTips: true,
  },
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: '12 May 2026',
    activeSessionsCount: 2,
  },
};

const STORAGE_KEY = 'synova_user_profile_v1';

const UserContext = createContext({
  user: defaultUserData,
  updateUser: () => {},
  resetUser: () => {},
  showNotificationToast: false,
  notificationToastMsg: '',
  triggerToast: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultUserData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load user profile from storage', e);
    }
    return defaultUserData;
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save user profile', e);
      }
      return updated;
    });
  };

  const resetUser = () => {
    setUser(defaultUserData);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset user profile', e);
    }
    triggerToast('Profile reset to default values.', 'info');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        resetUser,
        toast,
        triggerToast,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: defaultUserData,
      updateUser: () => {},
      resetUser: () => {},
      toast: { show: false, message: '', type: 'success' },
      triggerToast: () => {},
    };
  }
  return context;
}
