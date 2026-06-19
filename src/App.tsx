import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { MarketDataProviderWrapper } from '@/context/MarketDataContext';
import { SignalHistoryProvider } from '@/context/SignalHistoryContext';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { WelcomePage } from '@/pages/WelcomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { PocketOptionPage } from '@/pages/PocketOptionPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { VIPPage } from '@/pages/VIPPage';
import { AdminPage } from '@/pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <MarketDataProviderWrapper>
        <SignalHistoryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/pocket-option" element={<PocketOptionPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/vip" element={<VIPPage />} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SignalHistoryProvider>
      </MarketDataProviderWrapper>
    </AuthProvider>
  );
}
