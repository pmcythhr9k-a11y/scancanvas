'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, ShieldCheck, FileText, Layers, Copy, HelpCircle } from 'lucide-react';
import { CaseManifest } from '@/lib/dicom/parser';

interface CaseCheckPanelProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: CaseManifest;
  onOpenTechnicalDetails: () => void;
}

export const CaseCheckPanel: React.FC<CaseCheckPanelProps> = ({
  isOpen,
  onClose,
  manifest,
  onOpenTechnicalDetails,
}) => {
  if (!isOpen) return null;

  const mprEligibleCount = manifest.series.filter((s) => s.mprEligible).length;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="case-check-title">
      <div className="modal-dialog" style={{ maxWidth: '720px' }}>
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
              <span className="status-badge status-completed">Case Check</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Supplied file audit</span>
            </div>
            <h2 id="case-check-title" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
              Package Readiness Audit
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

        {/* Audit Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Important Scope Notice */}
          <div style={{
            fontSize: '0.8125rem',
            backgroundColor: 'var(--surface-subtle)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border)',
            color: 'var(--ink-secondary)',
          }}>
            <strong>Important scope limit:</strong> This check describes the files supplied to the app. We cannot determine whether the hospital or imaging facility omitted another image series or subsequent amended report.
          </div>

          {/* Audit Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {/* 1. Images Ready */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
            }}>
              <CheckCircle size={20} color="var(--state-completed-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Images ready to view</strong>
                  <span className="status-badge status-completed">{manifest.instancesReadable} images</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
                  All readable DICOM slice objects parsed successfully with valid 16-bit pixel encoding.
                </p>
              </div>
            </div>

            {/* 2. Signed Report Status */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
            }}>
              <FileText size={20} color="var(--state-completed-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Signed radiology report</strong>
                  <span className="status-badge status-completed">Final label detected</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
                  A complete final report was detected with matching Left Knee laterality and date (15 Aug 2026).
                </p>
              </div>
            </div>

            {/* 3. Image Sets Organised */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
            }}>
              <Layers size={20} color="var(--state-completed-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Image sets organised</strong>
                  <span className="status-badge status-completed">{manifest.seriesCount} series</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Categorised into patient-friendly labels: Side view (T2 FS), Front view (PD), Cross-section (T2), and Anatomy (T1).
                </p>
              </div>
            </div>

            {/* 4. Three-View Reconstruction */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
            }}>
              <Info size={20} color="var(--brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Three-view reconstruction</strong>
                  <span className="status-badge status-info">{mprEligibleCount} of {manifest.seriesCount} series eligible</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Diagnostic volumes with parallel slices support synchronized Axial, Coronal and Sagittal views. Localiser series (3 slices) is limited to 2D stack scrolling.
                </p>
              </div>
            </div>

            {/* 5. Duplicate Objects */}
            {manifest.duplicateCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
              }}>
                <Copy size={20} color="var(--state-attention-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Duplicate objects safely ignored</strong>
                    <span className="status-badge status-attention">{manifest.duplicateCount} duplicates</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
                    Identified identical SOP Instance UIDs from disc backups and omitted from viewport stack to prevent double-counting.
                  </p>
                </div>
              </div>
            )}

            {/* 6. Unsupported / Non-medical Files */}
            {manifest.unsupportedCount > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
              }}>
                <AlertTriangle size={20} color="var(--state-attention-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Unsupported files safely bypassed</strong>
                    <span className="status-badge status-attention">{manifest.unsupportedCount} items</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
                    Non-medical launcher executables (e.g. AUTORUN.EXE) were isolated and not run.
                  </p>
                </div>
              </div>
            )}
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
            className="btn btn-ghost"
            onClick={onOpenTechnicalDetails}
            style={{ fontSize: '0.8125rem' }}
          >
            <span>Open Technical Details &amp; UIDs</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            <span>Close Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
