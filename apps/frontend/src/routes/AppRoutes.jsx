import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import NewInsurancePage from '../pages/NewInsurancePage';
import RenewInsurancePage from '../pages/RenewInsurancePage';
import InsuranceVaultPage from '../pages/InsuranceVaultPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
      <Route path="/new-insurance" element={<NewInsurancePage />} />
      <Route path="/renew-insurance" element={<RenewInsurancePage />} />
      <Route path="/vault" element={<InsuranceVaultPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
    </Routes>
  );
}
