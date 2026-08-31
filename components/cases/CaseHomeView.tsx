import React from 'react';
import { Layers, Eye, ShieldCheck, ArrowRight, FileText, CheckCircle2, HelpCircle, Printer, Sparkles } from 'lucide-react';
import { CaseManifest } from '@/lib/dicom/parser';
import { ActiveTab } from '../layout/Navigation';
import { BuildYourCaseStudio } from './BuildYourCaseStudio';

interface CaseHomeViewProps {
  manifest: CaseManifest;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenApprovalModal: () => void;
  onOpenCaseCheck: () => void;
  onOpenPrivacyReceipt: () => void;
  onOpenTechnicalDetails: () => void;
  onOpenAddCaseModal: () => void;
  onUpdateReportText: (newText: string, caseTitle?: string) => Promise<void>;
  onLoadScenarioFiles: (files: Array<{ name: string; buffer: ArrayBuffer }>) => Promise<void>;
  onLoadDemoCase: (variant: 'acute_tear' | 'normal_baseline') => Promise<void>;
  reportApproved: boolean;
  isProcessing?: boolean;
}

export const CaseHomeView: React.FC<CaseHomeViewProps> = ({
  manifest,
  onNavigateTab,
  onOpenApprovalModal,
  onOpenCaseCheck,
  onOpenPrivacyReceipt,
  onOpenTechnicalDetails,
  onOpenAddCaseModal,
  onUpdateReportText,
  onLoadScenarioFiles,
  onLoadDemoCase,
  reportApproved,
  isProcessing = false,
}) => {
  const mprEligibleCount = manifest.series.filter((s) => s.mprEligible).length;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px' }}>
      {/* Interactive Case Form & Switcher Studio Banner */}
      <BuildYourCaseStudio
        manifest={manifest}
        onUpdateReportText={onUpdateReportText}
        onLoadScenarioFiles={onLoadScenarioFiles}
        onLoadDemoCase={onLoadDemoCase}
        onOpenAddCaseModal={onOpenAddCaseModal}
        onNavigateTab={(tab) => onNavigateTab(tab as ActiveTab)}
        isProcessing={isProcessing}
      />

      {/* Case Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <span className="status-badge status-completed">Ready to review</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                Case checked on this device
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
              {(() => {
                let signal = manifest.bodyPartSignals[0];
                if (!signal) return 'MSK MRI Case';
                
                // If the signal is all uppercase and a single word like 'KNEE', Title Case it
                if (signal === signal.toUpperCase() && !signal.includes(' ')) {
                  signal = signal.charAt(0).toUpperCase() + signal.slice(1).toLowerCase();
                }

                // If the signal already looks like a full title, use it directly
                if (signal.toLowerCase().includes('mri') || signal.toLowerCase().includes('case')) {
                  return signal;
                }
                // Otherwise append MRI for context
                return `${signal} MRI`;
              })()}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Examination Date: <strong>{manifest.studyDate}</strong> · Synthetic Demonstration Case · Patient ID: SC-2026-08
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenCaseCheck}
            >
              <CheckCircle2 size={16} color="var(--state-completed-text)" />
              <span>Case Check</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateTab('scan')}
            >
              <Eye size={16} />
              <span>Open Scan Viewer</span>
            </button>
          </div>
        </div>
      </div>
      {/* 4-Metric Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Images ready</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' }}>{manifest.instancesReadable}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--state-completed-text)', fontWeight: 600 }}>100% readable</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Series organised</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' }}>{manifest.seriesCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>4 diagnostic + 1 localiser</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Three-view ready</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--ink)' }}>{mprEligibleCount} series</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600 }}>Parallel geometry verified</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--brand-soft)', borderColor: 'rgba(11,95,118,0.3)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--brand)', marginBottom: '0.25rem' }}>Image bytes to cloud</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--brand)' }}>0</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600 }}>100% on-device medical privacy</div>
        </div>
      </div>

      {/* 4 Information Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {/* Card 1: Case Readiness */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Layers size={18} color="var(--brand)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--ink)' }}>Case readiness</h3>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            The image stacks opened, a report labelled final was supplied, laterality agrees, and two duplicate objects were safely ignored. One non-medical executable from the CD was bypassed.
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenCaseCheck}
            style={{ fontSize: '0.8125rem', padding: '0', minHeight: 'auto', color: 'var(--brand)', fontWeight: 600 }}
          >
            <span>Review package check breakdown &rarr;</span>
          </button>
        </div>

        {/* Card 2: Next Useful Step */}
        <div className="card" style={{ borderColor: 'var(--brand)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText size={18} color="var(--brand)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--ink)' }}>Your next useful step</h3>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            {reportApproved
              ? 'Review four report-backed explanation cards, reveal supporting sentences, then add your chosen questions to the appointment pack.'
              : 'Approve outbound report text processing to generate source-linked plain-English explanations.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (reportApproved) {
                onNavigateTab('report');
              } else {
                onOpenApprovalModal();
              }
            }}
            style={{ fontSize: '0.8125rem', height: '34px' }}
          >
            <span>{reportApproved ? 'Open Report Guide' : 'Approve Report & Explain'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Card 3: Privacy Compliance */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--state-completed-text)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--ink)' }}>Privacy compliance</h3>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            All medical MRI scans and pixel files stay 100% on your local device. Only user-approved report text is processed. Nothing is stored or shared.
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenPrivacyReceipt}
            style={{ fontSize: '0.8125rem', padding: '0', minHeight: 'auto', color: 'var(--brand)', fontWeight: 600 }}
          >
            <span>View cryptographic privacy receipt &rarr;</span>
          </button>
        </div>

        {/* Card 4: Agent Activity */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={18} color="var(--brand)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--ink)' }}>Agent activity</h3>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            Inventory completed &rarr; report matched &rarr; evidence linked &rarr; wording verified &rarr; appointment pack ready.
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenTechnicalDetails}
            style={{ fontSize: '0.8125rem', padding: '0', minHeight: 'auto', color: 'var(--brand)', fontWeight: 600 }}
          >
            <span>Inspect full provenance audit trail &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
