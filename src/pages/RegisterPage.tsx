import React, { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui';
import { Field } from '@/pages/LoginPage';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (res.ok) navigate('/dashboard');
    else setError(res.error || 'Registration failed');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <Logo size={36} />
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 380, marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 className="display" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Create your account</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 8px' }}>Start with 5 free AI signals every day.</p>

        <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Akinola Johnson" />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" />

        {error && <div style={{ fontSize: 13, color: 'var(--red)' }}>{error}</div>}

        <Button type="submit" full disabled={loading}>{loading ? 'Creating account…' : 'Create free account'}</Button>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
