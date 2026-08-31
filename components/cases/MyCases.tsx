'use client';

import React from 'react';
import { FolderUp, Play, Shield, FileCheck, Layers, HelpCircle, HardDrive } from 'lucide-react';
import { CaseManifest } from '@/lib/dicom/parser';

interface MyCasesProps {
  currentManifest: CaseManifest | null;
  onOpenCase: () => void;
  onAddCaseClick: () => void;
  onLoadSampleKneeCase: () => void;
  isLoadingSample: boolean;
}

export const MyCases: React.FC<MyCasesProps> = ({
  currentManifest,
  onOpenCase,
  onAddCaseClick,
  onLoadSampleKneeCase,
  isLoadingSample,
}) => {
  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      {/* Product Hero Banner */}
      <div style={{
        backgroundColor: '#123C4B',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-sm)',
        padding: '2.5rem 2rem',
        borderTop: '5px solid #4F8580',
        marginBottom: '2rem',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.625rem',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: '1rem',
        }}>
          <span>ScanCanvas · Private Musculoskeletal (MSK) MRI Workspace</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.25rem',
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}>
          Your scan, report and questions—together in one clear view.
        </h1>

        <p style={{
          fontSize: '1.0625rem',
          color: 'rgba(255, 255, 255, 0.88)',
          maxWidth: '760px',
          lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}>
          Bring an exported MRI scan and its signed radiology report into one private workspace.
          ScanCanvas checks the files on your device, organises compatible image series for guided viewing,
          explains the radiologist’s words in everyday language with exact source links, and prepares an Appointment Pack for your next conversation.
        </p>

        {/* Primary Intake Actions */}
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className="btn"
            onClick={onAddCaseClick}
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--ink)',
              fontWeight: 700,
              padding: '0.625rem 1.25rem',
              fontSize: '0.9375rem',
            }}
          >
            <FolderUp size={18} color="var(--brand)" />
            <span>Add an MRI folder / ZIP</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={onLoadSampleKneeCase}
            disabled={isLoadingSample}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: 600,
              padding: '0.625rem 1.25rem',
              fontSize: '0.9375rem',
            }}
          >
            <Play size={16} />
            <span>{isLoadingSample ? 'Inspecting demo files...' : 'Load Clinical Knee MRI (ACL Tear)'}</span>
          </button>
        </div>

        {/* Real-Life Patient Scenarios Testing Strip */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.22)',
          borderRadius: 'var(--radius-xs)',
          padding: '0.75rem 1rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#78CEE2', fontWeight: 700, marginBottom: '0.375rem' }}>
            Real-Life Test Scenarios (Hospital Disc, Portal ZIP &amp; Mixed Files)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onLoadSampleKneeCase}
              className="btn btn-ghost"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                padding: '0.25rem 0.625rem',
                minHeight: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span>1. Hospital CD Layout (DICOMDIR + Launcher)</span>
            </button>

            <button
              type="button"
              onClick={onLoadSampleKneeCase}
              className="btn btn-ghost"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                padding: '0.25rem 0.625rem',
                minHeight: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span>2. Portal ZIP (PocketHealth / MyChart UIDs)</span>
            </button>

            <button
              type="button"
              onClick={onLoadSampleKneeCase}
              className="btn btn-ghost"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                padding: '0.25rem 0.625rem',
                minHeight: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span>3. Mixed Folder (.IMA + Duplicates + Faults)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Case Section */}
      {currentManifest && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--brand)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="status-badge status-completed">Ready to review</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Checked on this device</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
                Left Knee MRI (Synthetic Demonstration)
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
                {currentManifest.studyDate} · {currentManifest.instancesReadable} images across {currentManifest.seriesCount} series · Final report attached
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenCase}
            >
              <span>Open Case Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Patient Intake Guidance Rows */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--ink)' }}>
          How to open your MRI records
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <HardDrive size={18} color="var(--brand)" />
              <strong style={{ fontSize: '0.9375rem' }}>Hospital CD or USB drive</strong>
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              Select the entire folder or disc drive. ScanCanvas safely catalogues DICOM images without executing any bundled CD launcher software.
            </p>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FolderUp size={18} color="var(--brand)" />
              <strong style={{ fontSize: '0.9375rem' }}>Portal ZIP download</strong>
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              Drop an exported ZIP from PocketHealth or patient portal. Files are expanded locally in your browser memory.
            </p>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileCheck size={18} color="var(--brand)" />
              <strong style={{ fontSize: '0.9375rem' }}>Signed radiology report</strong>
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              Add your report as a PDF, plain text or paste directly. You preview the exact text before any automated explanation begins.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice Box */}
      <div style={{
        backgroundColor: 'var(--surface-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}>
        <Shield size={20} color="var(--brand)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.875rem' }}>
          <strong style={{ color: 'var(--ink)' }}>Zero-Pixel Local Privacy:</strong>
          <span style={{ color: 'var(--ink-secondary)', marginLeft: '4px' }}>
            MRI pixel bytes never leave this device. Only explicit user-approved report text is sent to Google Cloud for structured plain-English translation.
          </span>
        </div>
      </div>
    </div>
  );
};
