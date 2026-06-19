import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserAccount, PlanTier } from '@/types';

interface AuthContextValue {
  user: UserAccount | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  upgradeToVIP: () => void;
  consumeSignal: () => boolean; // returns false if FREE limit reached
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'charlesfx_session_v1';
const USERS_KEY = 'charlesfx_users_v1';

function loadUsers(): Record<string, UserAccount & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch { return {}; }
}
function saveUsers(users: Record<string, UserAccount & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const persist = (u: UserAccount | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    const users = loadUsers();
    const found = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: 'No account found with that email.' };
    if (found.password !== password) return { ok: false, error: 'Incorrect password.' };
    const { password: _pw, ...account } = found;
    persist(account);
    return { ok: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = loadUsers();
    const exists = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, error: 'An account with that email already exists.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const isFirstUser = Object.keys(users).length === 0;
    const id = `usr_${Date.now()}`;
    const newUser: UserAccount & { password: string } = {
      id, name, email, password,
      plan: 'FREE',
      signalsUsedToday: 0,
      signalsDailyLimit: 5,
      createdAt: Date.now(),
      isAdmin: isFirstUser, // first registered user becomes admin for demo purposes
    };
    users[id] = newUser;
    saveUsers(users);
    const { password: _pw, ...account } = newUser;
    persist(account);
    return { ok: true };
  }, []);

  const logout = useCallback(() => persist(null), []);

  const upgradeToVIP = useCallback(() => {
    if (!user) return;
    const updated: UserAccount = { ...user, plan: 'VIP' as PlanTier, signalsDailyLimit: 9999 };
    const users = loadUsers();
    if (users[user.id]) {
      users[user.id] = { ...users[user.id], plan: 'VIP', signalsDailyLimit: 9999 };
      saveUsers(users);
    }
    persist(updated);
  }, [user]);

  const consumeSignal = useCallback(() => {
    if (!user) return true; // guests can preview without limit tracking in this demo
    if (user.plan === 'VIP') return true;
    if (user.signalsUsedToday >= user.signalsDailyLimit) return false;
    const updated = { ...user, signalsUsedToday: user.signalsUsedToday + 1 };
    const users = loadUsers();
    if (users[user.id]) {
      users[user.id] = { ...users[user.id], signalsUsedToday: updated.signalsUsedToday };
      saveUsers(users);
    }
    persist(updated);
    return true;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, upgradeToVIP, consumeSignal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
