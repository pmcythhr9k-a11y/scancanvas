'use client';

import React, { useState } from 'react';
import { UploadCloud, RefreshCw, Check, Eye, FileText, Sparkles, HelpCircle, Info, Database } from 'lucide-react';
import { CaseManifest } from '@/lib/dicom/parser';
import { SYNTHETIC_FINAL_REPORT } from '@/lib/fixtures/synthetic-reports';
import { generateHospitalCdScenario, generatePortalZipScenario, generateMixedFolderScenario } from '@/lib/fixtures/real-scenarios';

interface BuildYourCaseStudioProps {
  manifest: CaseManifest;
  onUpdateReportText: (newText: string, caseTitle?: string) => Promise<void>;
  onLoadScenarioFiles: (files: Array<{ name: string; buffer: ArrayBuffer }>) => Promise<void>;
  onLoadDemoCase: (variant: 'acute_tear' | 'normal_baseline') => Promise<void>;
  onOpenAddCaseModal: () => void;
  onNavigateTab: (tab: 'scan' | 'report' | 'handoff') => void;
  isProcessing: boolean;
}

export const BuildYourCaseStudio: React.FC<BuildYourCaseStudioProps> = ({
  manifest,
  onUpdateReportText,
  onLoadScenarioFiles,
  onLoadDemoCase,
  onOpenAddCaseModal,
  onNavigateTab,
  isProcessing,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'knee' | 'hospital' | 'portal' | 'siemens' | 'custom'>('knee');
  const [caseTitle, setCaseTitle] = useState(manifest.bodyPartSignals[0] ? `${manifest.bodyPartSignals[0]} MRI` : 'Knee MRI Case');
  const [reportText, setReportText] = useState(manifest.report.text || SYNTHETIC_FINAL_REPORT.fullText);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);

  // Handle preset selection
  const handleSelectPreset = async (preset: 'knee' | 'hospital' | 'portal' | 'siemens' | 'custom') => {
    setSelectedPreset(preset);

    if (preset === 'knee') {
      setCaseTitle('Left Knee MRI (Radiopaedia Reference)');
      setReportText(SYNTHETIC_FINAL_REPORT.fullText);
      await onLoadDemoCase('acute_tear');
    } else if (preset === 'hospital') {
      const files = generateHospitalCdScenario();
      setCaseTitle('Hospital Disc Intake (DICOMDIR)');
      setReportText(SYNTHETIC_FINAL_REPORT.fullText);
      await onLoadScenarioFiles(files);
    } else if (preset === 'portal') {
      const files = generatePortalZipScenario();
      setCaseTitle('Patient Portal Export (Raw UIDs)');
      setReportText(SYNTHETIC_FINAL_REPORT.fullText);
      await onLoadScenarioFiles(files);
    } else if (preset === 'siemens') {
      const files = generateMixedFolderScenario();
      setCaseTitle('Siemens Multi-Series Study (.IMA)');
      setReportText(SYNTHETIC_FINAL_REPORT.fullText);
      await onLoadScenarioFiles(files);
    }
  };

  const handleApplyChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveSuccess(false);
    try {
      await onUpdateReportText(reportText, caseTitle);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update report:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const presets = [
    {
      id: 'knee',
      label: 'Left Knee (Standard Demo)',
      desc: '5 scan series · 135 slices',
      tooltip: 'Standard clinical knee exam with Sagittal, Coronal, and Axial views showing an ACL injury.',
    },
    {
      id: 'hospital',
      label: 'Hospital CD-ROM Disc',
      desc: 'DICOMDIR + patient folders',
      tooltip: 'Simulates loading files directly from a hospital patient CD, automatically skipping viewer executables.',
    },
    {
      id: 'portal',
      label: 'Online Portal Download',
      desc: 'ZIP archive with raw UIDs',
      tooltip: 'Simulates opening an unorganised ZIP archive exported from an online patient portal.',
    },
    {
      id: 'siemens',
      label: 'Scanner Export (.IMA)',
      desc: '136 slices + duplicate filter',
      tooltip: 'Tests hospital scanner export files with automatic duplicate slice detection and removal.',
    },
    {
      id: 'custom',
      label: 'Custom Report Builder',
      desc: 'Write or paste your report',
      tooltip: 'Paste any clinical report text below to see how Gemini 3.7 Flash translates it into plain English.',
    },
  ];

  const stepDescriptions = [
    {
      step: 1,
      title: 'Step 1: Select Data Source',
      body: 'Pick an example MRI, or upload your own scan files (from a CD or portal) to see how the system handles different formats.',
    },
    {
      step: 2,
      title: 'Step 2: New Clinical Data',
      body: 'Review the medical report. You can edit the text or paste a completely different report to test the AI explanation feature.',
    },
    {
      step: 3,
      title: 'Step 3: Analyze Case',
      body: 'Click the button below to translate the medical jargon into plain English, or open the Viewer to explore the MRI images.',
    },
  ];

  return (
    <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border)', backgroundColor: '#FFFFFF', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}>
      {/* Studio Header Banner */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--brand-soft)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(11, 95, 118, 0.25)'
          }}>
            <Database size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--brand)', margin: 0, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Scan Analysis Studio</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--brand)', opacity: 0.8 }}>
                (Musculoskeletal / MSK MRI &amp; DICOM Case Studio)
              </span>
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--ink)', margin: '4px 0 0', opacity: 0.85 }}>
              Follow the 3 steps below to load a case, review data, and get an AI explanation.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenAddCaseModal}
          disabled={isProcessing}
          style={{ fontSize: '0.875rem', height: '38px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          title="Upload your own DICOM or ZIP file from your computer"
        >
          <UploadCloud size={16} />
          <span>Upload Your Own Files</span>
        </button>
      </div>

      <div style={{ padding: '2rem 1.5rem' }}>
        {/* Step 1: Scenario Selection */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredBadge(1)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <span
                style={{ 
                  backgroundColor: hoveredBadge === 1 ? 'var(--brand-dark, #083E4E)' : 'var(--brand)', 
                  color: '#FFFFFF', 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  transform: hoveredBadge === 1 ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: hoveredBadge === 1 ? '0 0 0 4px rgba(11, 95, 118, 0.2)' : 'none',
                }}
                title={stepDescriptions[0].body}
              >
                1
              </span>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                Select Data Source
              </h3>

              {/* Interactive Hover Card for Step 1 */}
              {hoveredBadge === 1 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '6px',
                  zIndex: 40,
                  width: '320px',
                  backgroundColor: '#FFFFFF',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8125rem',
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Info size={14} /> {stepDescriptions[0].title}
                  </div>
                  <div>{stepDescriptions[0].body}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
              <HelpCircle size={14} />
              <span>Hover badges or click cards for details</span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0 0 1rem 2.375rem' }}>
            Choose a pre-loaded example study or upload your own files to explore how the viewer works.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.875rem',
            paddingLeft: '2.375rem'
          }}>
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id as any)}
                  disabled={isProcessing || isUpdating}
                  title={preset.tooltip}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
                    backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 4px rgba(11, 95, 118, 0.08)' : 'none',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <strong style={{ fontSize: '0.9375rem', color: isSelected ? 'var(--brand)' : 'var(--ink)' }}>
                      {preset.label}
                    </strong>
                    {isSelected && <Check size={16} color="var(--brand)" style={{ flexShrink: 0 }} />}
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: isSelected ? 'var(--brand)' : 'var(--muted)', marginTop: '4px' }}>
                    {preset.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Clinical Details */}
        <form onSubmit={handleApplyChanges} style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredBadge(2)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <span
                  style={{ 
                    backgroundColor: hoveredBadge === 2 ? 'var(--brand-dark, #083E4E)' : 'var(--brand)', 
                    color: '#FFFFFF', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                    transform: hoveredBadge === 2 ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: hoveredBadge === 2 ? '0 0 0 4px rgba(11, 95, 118, 0.2)' : 'none',
                  }}
                  title={stepDescriptions[1].body}
                >
                  2
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  New Clinical Data
                </h3>

                {/* Interactive Hover Card for Step 2 */}
                {hoveredBadge === 2 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    zIndex: 40,
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8125rem',
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Info size={14} /> {stepDescriptions[1].title}
                    </div>
                    <div>{stepDescriptions[1].body}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
                <Info size={14} />
                <span>Text stays 100% on your device</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0 0 1rem 2.375rem' }}>
              Read the radiologist's findings or type your own changes. You can test how AI explains custom reports.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '2.375rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="case-title-input" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>
                    Case Title / Study Name
                  </label>
                  <input
                    id="case-title-input"
                    type="text"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    placeholder="e.g. Left Knee MRI"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.9375rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      color: 'var(--ink)',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>
                    Attached MRI Scans
                  </label>
                  <div style={{
                    padding: '0.625rem 0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-subtle)',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span>{manifest.instancesReadable} slices loaded ({manifest.seriesCount} scan series)</span>
                    <span className="status-badge status-completed" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                      Local Only
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="report-textarea" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.375rem' }}>
                  Radiologist Report Text (Editable)
                </label>
                <textarea
                  id="report-textarea"
                  rows={7}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Paste or write any MRI radiology report here..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)',
                    lineHeight: 1.5,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    backgroundColor: '#FFFFFF',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Analysis */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredBadge(3)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <span
                  style={{ 
                    backgroundColor: hoveredBadge === 3 ? 'var(--brand-dark, #083E4E)' : 'var(--brand)', 
                    color: '#FFFFFF', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                    transform: hoveredBadge === 3 ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: hoveredBadge === 3 ? '0 0 0 4px rgba(11, 95, 118, 0.2)' : 'none',
                  }}
                  title={stepDescriptions[2].body}
                >
                  3
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Analyze Case
                </h3>

                {/* Interactive Hover Card for Step 3 */}
                {hoveredBadge === 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    zIndex: 40,
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8125rem',
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Info size={14} /> {stepDescriptions[2].title}
                    </div>
                    <div>{stepDescriptions[2].body}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--brand)', fontWeight: 600 }}>
                <Sparkles size={14} />
                <span>Powered by Gemini 3.7 Flash</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0 0 1.25rem 2.375rem' }}>
              Run AI analysis to translate complex findings into plain English, or jump straight into the scan viewer.
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingLeft: '2.375rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={isUpdating || isProcessing}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9375rem', padding: '0.75rem 1.375rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  title="Processes report text with Gemini 3.7 Flash to generate plain English explanations and questions for your doctor"
                >
                  <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
                  <span>{isUpdating ? 'Explaining with Gemini 3.7 Flash...' : 'Explain Report with AI'}</span>
                </button>

                {saveSuccess && (
                  <span style={{ fontSize: '0.875rem', color: '#15803D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Analysis Updated!
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onNavigateTab('scan')}
                  style={{ fontSize: '0.875rem', padding: '0.625rem 1rem' }}
                  title="Open the interactive PACS viewer to inspect scan slices in detail"
                >
                  <Eye size={15} />
                  <span>Open Scan Viewer</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onNavigateTab('report')}
                  style={{ fontSize: '0.875rem', padding: '0.625rem 1rem' }}
                  title="View the line-by-line Report Guide with clinical definitions and questions for your doctor"
                >
                  <FileText size={15} />
                  <span>View Report Guide</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
