'use client';

import React from 'react';
import { X, ShieldCheck, ArrowRight, Lock, Check } from 'lucide-react';

interface OutboundApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
  onApprove: () => Promise<void>;
  isApproving: boolean;
}

export const OutboundApprovalModal: React.FC<OutboundApprovalModalProps> = ({
  isOpen,
  onClose,
  reportText,
  onApprove,
  isApproving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="approval-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '680px' }}>
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
              <span className="status-badge status-info">Just-in-Time Privacy Review</span>
            </div>
            <h2 id="approval-modal-title" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
              Review Outbound Report Text
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isApproving}
            style={{ padding: '0.25rem', minHeight: 'auto' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Zero Pixel Notice */}
          <div style={{
            backgroundColor: 'var(--state-completed-bg)',
            border: '1px solid rgba(35,108,85,0.3)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}>
            <ShieldCheck size={20} color="var(--state-completed-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--state-completed-text)' }}>
              <strong>Zero MRI Pixels Sent:</strong> Your scan image slices remain strictly on this device. Only the text previewed below will be sent to Google Cloud Run and Gemini 3.7 Flash to generate plain-English explanations.
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem' }}>
              Exact Report Text Proposed for Processing ({reportText.length} characters):
            </div>
            <div style={{
              maxHeight: '260px',
              overflowY: 'auto',
              backgroundColor: 'var(--canvas)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              lineHeight: 1.6,
              color: 'var(--ink)',
              whiteSpace: 'pre-wrap',
            }}>
              {reportText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isApproving}
          >
            <span>Cancel</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onApprove}
            disabled={isApproving}
          >
            <Lock size={15} />
            <span>{isApproving ? 'Verifying with Gemini...' : 'Approve & Create Report Guide'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
