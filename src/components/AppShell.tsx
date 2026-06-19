import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export function AppShell() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
