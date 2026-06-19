import React, { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.error || 'Login failed');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <Logo size={36} />
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380, marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 className="display" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Welcome back</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Log in to access your signal terminal.</p>

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

        {error && <div style={{ fontSize: 13, color: 'var(--red)' }}>{error}</div>}

        <Button type="submit" full disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</Button>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
          New here? <Link to="/register" style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export function Field({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        required
        style={{
          padding: '11px 13px', borderRadius: 10, border: '1px solid var(--hairline)',
          background: 'var(--panel)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
        }}
      />
    </label>
  );
}
