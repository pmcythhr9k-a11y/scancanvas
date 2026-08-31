'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';

interface LoginGateProps {
  onUnlock: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const cleanInput = password.trim();

    // Validate passkey
    if (cleanInput.length >= 3) {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('scancanvas_auth_session', 'authenticated');
        }
        setIsSubmitting(false);
        onUnlock();
      }, 350);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setError('Please enter a valid access passkey to continue');
      }, 250);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--canvas)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.25rem',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        {/* Brand Header with ScanCanvas Logo */}
        <div style={{
          backgroundColor: 'var(--ink)',
          color: '#FFFFFF',
          padding: '2.25rem 1.75rem 1.75rem',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'rgba(120, 206, 226, 0.12)',
            border: '1.5px solid rgba(120, 206, 226, 0.35)',
            marginBottom: '1rem',
          }}>
            <svg width="34" height="34" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M52 8H12V56H52" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="square" />
              <path d="M24 21H49M28 32H49M32 43H49" stroke="#78CEE2" strokeWidth="4.5" strokeLinecap="square" />
            </svg>
          </div>

          <h1 style={{ fontSize: '1.4375rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            ScanCanvas
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.4 }}>
            Private MRI Record &amp; Consultation Workspace
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem' }}>
          <div style={{
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.75rem 1rem',
            border: '1px solid var(--border)',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: 'var(--ink-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <ShieldCheck size={18} color="var(--brand)" style={{ flexShrink: 0 }} />
            <span>Private Demonstration Access Gate</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label
                htmlFor="access-code"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}
              >
                Access Passkey
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  id="access-code"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your passkey"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '0.6875rem 2.5rem 0.6875rem 0.875rem',
                    fontSize: '0.9375rem',
                    borderRadius: 'var(--radius-xs)',
                    border: error ? '1.5px solid #EF4444' : '1px solid var(--border)',
                    outline: 'none',
                    color: 'var(--ink)',
                    backgroundColor: '#FFFFFF',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                justifyContent: 'center',
                fontSize: '0.9375rem',
                fontWeight: 600,
                marginTop: '0.25rem',
              }}
            >
              <span>{isSubmitting ? 'Unlocking...' : 'Unlock Workspace'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Privacy Compliance Notice */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--muted)',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '0.25rem' }}>
              Fully Privacy Compliant
            </div>
            <div>All medical MRI scans and clinical data stay 100% on your local device.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
