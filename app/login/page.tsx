'use client';

import React, { useState } from 'react';
import styles from './styles.module.css';

interface LoginData {
  email: string;
  password: string;
}
interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include',
      });
      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Login fehlgeschlagen');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Netzwerkfehler');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth?action=signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
        credentials: 'include',
      });
      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Registrierung fehlgeschlagen');
      } else {
        window.location.href = '/dashboard';
      }
    } catch {
      setError('Netzwerkfehler');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.logo}>📖 Bookshop</h2>

        <div className={styles.tabs}>
          <button
            className={mode === 'login' ? styles.activeTab : styles.tab}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
          >
            Login
          </button>
          <button
            className={mode === 'signup' ? styles.activeTab : styles.tab}
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
          >
            Signup
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                placeholder="du@example.com"
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="loginPassword">Passwort</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className={styles.showBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button}>
              Einloggen
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">Vorname</label>
              <input
                id="firstName"
                type="text"
                placeholder="Max"
                value={signupData.firstName}
                onChange={e => setSignupData({ ...signupData, firstName: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Nachname</label>
              <input
                id="lastName"
                type="text"
                placeholder="Mustermann"
                value={signupData.lastName}
                onChange={e => setSignupData({ ...signupData, lastName: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="signupEmail">Email</label>
              <input
                id="signupEmail"
                type="email"
                placeholder="du@example.com"
                value={signupData.email}
                onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="signupPassword">Passwort</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className={styles.showBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">Rolle</label>
              <select
                id="role"
                value={signupData.role}
                onChange={e =>
                  setSignupData({ ...signupData, role: e.target.value as 'customer' | 'admin' })
                }
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button}>
              Registrieren
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
