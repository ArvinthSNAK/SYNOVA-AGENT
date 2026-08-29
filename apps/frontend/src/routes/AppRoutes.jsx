import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import NewInsurancePage from '../pages/NewInsurancePage';
import RenewInsurancePage from '../pages/RenewInsurancePage';
import InsuranceVaultPage from '../pages/InsuranceVaultPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import MarketplacePage from '../pages/MarketplacePage';
import AIAgent from '../pages/AIAgent';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/login" element={<SignInPage />} />
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
      
      {/* Realtime AI Voice Agent / Advisor */}
      <Route path="/agent" element={<AIAgent />} />
      <Route path="/ai-agent" element={<AIAgent />} />
      <Route path="/voice-advisor" element={<AIAgent />} />

      {/* Marketplace & Categories */}
      <Route path="/policies" element={<MarketplacePage />} />
      <Route path="/insurance" element={<MarketplacePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/all-policies" element={<MarketplacePage />} />
      <Route path="/motor" element={<MarketplacePage />} />
      <Route path="/health" element={<MarketplacePage />} />
      <Route path="/term" element={<MarketplacePage />} />
      <Route path="/term-life" element={<MarketplacePage />} />
      <Route path="/get-started" element={<MarketplacePage />} />
      <Route path="/quote" element={<MarketplacePage />} />

      {/* Motor Quote Automation & Renewals */}
      <Route path="/new-insurance" element={<NewInsurancePage />} />
      <Route path="/compare" element={<NewInsurancePage />} />
      <Route path="/renew-insurance" element={<RenewInsurancePage />} />
      <Route path="/renewals" element={<RenewInsurancePage />} />
      <Route path="/renew" element={<RenewInsurancePage />} />

      {/* Insurance Vault & Claims */}
      <Route path="/insurance-vault" element={<InsuranceVaultPage />} />
      <Route path="/vault" element={<InsuranceVaultPage />} />
      <Route path="/claims" element={<InsuranceVaultPage />} />
      <Route path="/my-policies" element={<InsuranceVaultPage />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboardPage />} />
    </Routes>
  );
}
