'use client';

import React from 'react';
import { ShieldCheck, Printer, CheckCircle, LogOut } from 'lucide-react';

interface TopBarProps {
  caseTitle: string;
  caseMeta?: string;
  onOpenCaseCheck: () => void;
  onOpenPreparePack: () => void;
  onOpenPrivacyReceipt: () => void;
  onOpenClinicalReferences?: () => void;
  onNavigateHome?: () => void;
  onSignOut?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  caseTitle,
  caseMeta = 'MSK MRI · Final report verified',
  onOpenCaseCheck,
  onOpenPreparePack,
  onOpenPrivacyReceipt,
  onOpenClinicalReferences,
  onNavigateHome,
  onSignOut,
}) => {
  return (
    <header className="topbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-header)'
    }}>
      <div className="container" style={{
        minHeight: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingTop: '0.25rem',
        paddingBottom: '0.25rem'
      }}>
        {/* Brand & Case Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            type="button"
            onClick={onNavigateHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: onNavigateHome ? 'pointer' : 'default',
              textAlign: 'left',
            }}
            title="Return to Case Home"
          >
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M52 8H12V56H52" stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="square" />
              <path d="M24 21H49M28 32H49M32 43H49" stroke="var(--brand)" strokeWidth="4.5" strokeLinecap="square" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: '1.1875rem',
              color: 'var(--ink)',
              letterSpacing: '-0.01em'
            }}>
              ScanCanvas
            </span>
          </button>

          <div className="topbar-meta" style={{
            height: '20px',
            width: '1px',
            backgroundColor: 'var(--border)',
            margin: '0 0.25rem'
          }} />

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>
              {caseTitle}
            </div>
            <div className="topbar-meta" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {caseMeta}
            </div>
          </div>
        </div>

        {/* Actions & Privacy Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
          {onOpenClinicalReferences && (
            <button
              type="button"
              className="btn btn-ghost topbar-clinical-ref"
              onClick={onOpenClinicalReferences}
              title="View Radiopaedia and clinical image citations"
              style={{ fontSize: '0.75rem', height: '32px', padding: '0 0.5rem', color: 'var(--muted)', fontWeight: 600 }}
            >
              <span>Clinical References</span>
            </button>
          )}

          <button
            type="button"
            className="privacy-receipt-pill topbar-privacy-pill"
            onClick={onOpenPrivacyReceipt}
            title="Inspect verifiable local privacy receipt"
            style={{ cursor: 'pointer', border: '1px solid rgba(11,95,118,0.25)' }}
          >
            <ShieldCheck size={15} />
            <span className="topbar-privacy-text-full">Privacy Compliant (Data stays on device)</span>
            <span className="topbar-privacy-text-short">Data on device</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary topbar-btn"
            onClick={onOpenCaseCheck}
            title="Open Case Check Summary"
            style={{ height: '36px', fontSize: '0.875rem', padding: '0 0.75rem' }}
          >
            <CheckCircle size={15} color="var(--state-completed-text)" />
            <span className="topbar-btn-text">Case Check</span>
          </button>

          <button
            type="button"
            className="btn btn-primary topbar-btn"
            onClick={onOpenPreparePack}
            title="Prepare Appointment Pack"
            style={{ height: '36px', fontSize: '0.875rem', padding: '0 0.875rem' }}
          >
            <Printer size={15} />
            <span className="topbar-btn-text">Appointment Pack</span>
          </button>

          {onSignOut && (
            <button
              type="button"
              className="btn btn-ghost topbar-btn"
              onClick={onSignOut}
              title="Sign Out & Lock Workspace"
              style={{ height: '36px', padding: '0 0.5rem', color: 'var(--muted)' }}
            >
              <LogOut size={15} />
              <span className="topbar-btn-text" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
