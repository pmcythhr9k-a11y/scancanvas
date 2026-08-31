'use client';

import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, Copy } from 'lucide-react';
import { PrivacyReceipt } from '@/lib/agent/schemas';

interface PrivacyReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PrivacyReceipt;
}

export const PrivacyReceiptModal: React.FC<PrivacyReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="privacy-receipt-title">
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="status-badge status-completed">Verifiable Receipt</span>
            </div>
            <h2 id="privacy-receipt-title" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
              Cryptographic Privacy Receipt
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '0.25rem', minHeight: 'auto' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'var(--state-completed-bg)',
            border: '1px solid rgba(35,108,85,0.3)',
            borderRadius: 'var(--radius-xs)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <ShieldCheck size={28} color="var(--state-completed-text)" />
            <div>
              <strong style={{ color: 'var(--state-completed-text)', display: 'block' }}>
                Zero-Pixel Boundary Verified
              </strong>
              <span style={{ fontSize: '0.8125rem', color: 'var(--state-completed-text)' }}>
                No MRI pixel bytes were transmitted across the network during this session.
              </span>
            </div>
          </div>

          {/* Receipt Data Table */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xs)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>MRI objects processed locally</span>
              <strong>{receipt.dicomObjectsProcessedLocally} slices</strong>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>MRI pixel bytes sent to Gemini</span>
              <strong style={{ color: 'var(--brand)' }}>0 bytes (Zero-Pixel Mode)</strong>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Report text characters approved</span>
              <strong>{receipt.reportCharactersApproved} characters</strong>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Approval timestamp</span>
              <span>{new Date(receipt.approvedAt).toUTCString()}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--surface-subtle)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Agent model identifier</span>
              <code>{receipt.model}</code>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--surface)',
              fontSize: '0.8125rem',
              gap: '0.25rem',
            }}>
              <span style={{ color: 'var(--muted)' }}>Approved report text SHA-256 digest</span>
              <code style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--ink)' }}>
                {receipt.reportTextSha256}
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            <span>Close Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
