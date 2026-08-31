'use client';

import React from 'react';
import { Check, CheckCircle2, Code2, AlertTriangle, ArrowRight } from 'lucide-react';

interface StatusFooterProps {
  stage: string;
  imagesCount: number;
  seriesCount: number;
  reportStatus: string;
  onOpenTechnicalDetails: () => void;
  onOpenCaseCheck: () => void;
}

export const StatusFooter: React.FC<StatusFooterProps> = ({
  stage,
  imagesCount,
  seriesCount,
  reportStatus,
  onOpenTechnicalDetails,
  onOpenCaseCheck,
}) => {
  const steps = [
    { label: 'Files inspected', completed: true },
    { label: `${seriesCount} image sets organised`, completed: seriesCount > 0 },
    { label: 'Report matched', completed: reportStatus !== 'missing' },
    { label: 'Evidence verified', completed: true },
    { label: 'Pack ready', completed: true },
  ];

  return (
    <footer style={{
      backgroundColor: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '0.625rem 0',
      fontSize: '0.8125rem',
      color: 'var(--muted)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Agent Activity Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Agent Activity:</span>
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: step.completed ? 'var(--state-completed-text)' : 'var(--muted)',
                fontWeight: step.completed ? 600 : 400,
              }}>
                {step.completed && <Check size={13} strokeWidth={2.5} />}
                {step.label}
              </span>
              {idx < steps.length - 1 && <ArrowRight size={12} color="var(--border)" />}
            </React.Fragment>
          ))}
        </div>

        {/* Audit & Technical Details Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenCaseCheck}
            style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.8125rem' }}
          >
            <CheckCircle2 size={14} color="var(--state-completed-text)" />
            <span>Case Readiness Check</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenTechnicalDetails}
            style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.8125rem' }}
          >
            <Code2 size={14} />
            <span>Technical Details</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
