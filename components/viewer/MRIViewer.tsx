'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  Move,
  SunMedium,
  RotateCcw,
  Maximize,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Check,
  HelpCircle,
} from 'lucide-react';
import { SeriesGroup, ParsedDicomInstance } from '@/lib/dicom/parser';
import { buildVoxelVolume, Volume3D } from '@/lib/dicom/geometry';
import { SeriesRail } from './SeriesRail';
import { ViewportStack } from './ViewportStack';
import { MultiplanarView } from './MultiplanarView';
import { EvidenceCard } from '@/lib/agent/schemas';

interface MRIViewerProps {
  series: SeriesGroup[];
  evidenceCards: EvidenceCard[];
  onAddQuestion: (question: string) => void;
  addedQuestions: Set<string>;
}

export const MRIViewer: React.FC<MRIViewerProps> = ({
  series,
  evidenceCards,
  onAddQuestion,
  addedQuestions,
}) => {
  const [selectedSeriesUid, setSelectedSeriesUid] = useState<string>(
    series[0]?.seriesInstanceUid || ''
  );
  const [viewMode, setViewMode] = useState<'slices' | 'mpr'>('slices');
  const [sliceIndex, setSliceIndex] = useState(18);
  const [activeTool, setActiveTool] = useState<'scroll' | 'zoom' | 'pan' | 'contrast'>('scroll');
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [revealedWordingId, setRevealedWordingId] = useState<string | null>(null);

  // Sync selected series whenever series prop changes
  useEffect(() => {
    if (series && series.length > 0) {
      if (!selectedSeriesUid || !series.some((s) => s.seriesInstanceUid === selectedSeriesUid)) {
        setSelectedSeriesUid(series[0].seriesInstanceUid);
        const midSlice = Math.max(1, Math.floor(series[0].instanceCount / 2));
        setSliceIndex(midSlice);
      }
    }
  }, [series, selectedSeriesUid]);

  // Active series
  const activeSeries = useMemo(() => {
    if (!series || series.length === 0) return null;
    return series.find((s) => s.seriesInstanceUid === selectedSeriesUid) || series[0];
  }, [series, selectedSeriesUid]);

  // Active instance slice
  const activeInstance: ParsedDicomInstance | null = useMemo(() => {
    if (!activeSeries || !activeSeries.instances || activeSeries.instances.length === 0) return null;
    const clampedIdx = Math.max(0, Math.min(activeSeries.instances.length - 1, sliceIndex - 1));
    return activeSeries.instances[clampedIdx] || null;
  }, [activeSeries, sliceIndex]);

  // 3D Voxel volume for MPR
  const volume: Volume3D | null = useMemo(() => {
    if (!activeSeries || !activeSeries.mprEligible) return null;
    return buildVoxelVolume(activeSeries.instances, activeSeries.plane as 'sagittal' | 'coronal' | 'axial');
  }, [activeSeries]);

  // Reset tools
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setBrightness(0);
    setContrast(0);
    setActiveTool('scroll');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setSliceIndex((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSliceIndex((prev) => Math.min(activeSeries?.instanceCount || 34, prev + 1));
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((prev) => Math.min(4.0, prev + 0.15));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((prev) => Math.max(0.5, prev - 0.15));
      } else if (e.key === '0') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSeries]);

  return (
    <div className="pacs-container" style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      minHeight: '620px',
      backgroundColor: 'var(--viewer-canvas)',
      overflow: 'hidden',
    }}>
      {/* 1. Left Series Rail */}
      <SeriesRail
        series={series}
        selectedSeriesUid={selectedSeriesUid}
        onSelectSeries={(uid) => {
          setSelectedSeriesUid(uid);
          setSliceIndex(18);
          handleReset();
        }}
      />

      {/* 2. Center Viewport Area */}
      <main className="pacs-viewport-wrapper" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        backgroundColor: 'var(--viewer-canvas)',
      }}>
        {/* Toolbar */}
        <div style={{
          height: '48px',
          backgroundColor: 'var(--viewer-panel)',
          borderBottom: '1px solid var(--viewer-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          color: 'var(--viewer-text)',
          gap: '1rem',
        }}>
          {/* Tool Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setActiveTool('scroll')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: activeTool === 'scroll' ? 'var(--viewer-selected)' : 'transparent',
                color: activeTool === 'scroll' ? 'var(--viewer-text)' : 'var(--viewer-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <span>Scroll</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('zoom')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: activeTool === 'zoom' ? 'var(--viewer-selected)' : 'transparent',
                color: activeTool === 'zoom' ? 'var(--viewer-text)' : 'var(--viewer-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <ZoomIn size={14} />
              <span>Zoom</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('pan')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: activeTool === 'pan' ? 'var(--viewer-selected)' : 'transparent',
                color: activeTool === 'pan' ? 'var(--viewer-text)' : 'var(--viewer-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <Move size={14} />
              <span>Pan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('contrast')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: activeTool === 'contrast' ? 'var(--viewer-selected)' : 'transparent',
                color: activeTool === 'contrast' ? 'var(--viewer-text)' : 'var(--viewer-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <SunMedium size={14} />
              <span>Contrast</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'transparent',
                color: 'var(--viewer-muted)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8125rem',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          {/* Mode Switch: Slices vs Three Views */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#05080A',
              padding: '2px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--viewer-divider)',
            }}>
              <button
                type="button"
                onClick={() => setViewMode('slices')}
                style={{
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '2px',
                  backgroundColor: viewMode === 'slices' ? 'var(--viewer-selected)' : 'transparent',
                  color: viewMode === 'slices' ? 'var(--viewer-text)' : 'var(--viewer-muted)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Slices
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeSeries?.mprEligible) {
                    setViewMode('mpr');
                  } else {
                    alert('Three-view reconstruction is unavailable for this series: slices are non-orthogonal survey images.');
                  }
                }}
                style={{
                  padding: '0.25rem 0.625rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '2px',
                  backgroundColor: viewMode === 'mpr' ? 'var(--viewer-selected)' : 'transparent',
                  color: activeSeries?.mprEligible ? (viewMode === 'mpr' ? 'var(--viewer-text)' : 'var(--viewer-muted)') : '#4A5B64',
                  border: 'none',
                  cursor: activeSeries?.mprEligible ? 'pointer' : 'not-allowed',
                }}
              >
                Three Views
              </button>
            </div>

            <span style={{ fontSize: '0.8125rem', color: 'var(--viewer-focus)', fontWeight: 600 }}>
              {activeSeries?.friendlyLabel}
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {viewMode === 'slices' ? (
            <ViewportStack
              instance={activeInstance}
              planeLabel={activeSeries?.friendlyLabel}
              orientationText={activeSeries?.plane === 'sagittal' ? 'H → F' : activeSeries?.plane === 'coronal' ? 'R · L' : 'A · P'}
              zoom={zoom}
              pan={pan}
              brightness={brightness}
              contrast={contrast}
              activeTool={activeTool}
              onWheelSlice={(delta) => {
                setSliceIndex((prev) => Math.max(1, Math.min(activeSeries?.instanceCount || 34, prev + delta)));
              }}
              onPanChange={setPan}
              onZoomChange={setZoom}
              onContrastChange={(b, c) => {
                setBrightness(b);
                setContrast(c);
              }}
            />
          ) : (
            <MultiplanarView
              volume={volume}
              currentSliceIndex={sliceIndex}
              onSliceChange={setSliceIndex}
              instances={activeSeries?.instances || []}
            />
          )}
        </div>

        {/* Slice Scrubber & Controls */}
        <div style={{
          height: '44px',
          backgroundColor: 'var(--viewer-panel)',
          borderTop: '1px solid var(--viewer-divider)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.25rem',
          gap: '1rem',
          color: 'var(--viewer-text)',
        }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setSliceIndex((prev) => Math.max(1, prev - 1))}
            style={{ color: 'var(--viewer-text)', padding: '0.25rem', minHeight: '32px' }}
            aria-label="Previous slice"
          >
            <ChevronLeft size={18} />
          </button>

          <input
            type="range"
            min={1}
            max={activeSeries?.instanceCount || 34}
            value={sliceIndex}
            onChange={(e) => setSliceIndex(parseInt(e.target.value, 10))}
            style={{ flex: 1, accentColor: 'var(--viewer-focus)' }}
            aria-label="Slice slider"
          />

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setSliceIndex((prev) => Math.min(activeSeries?.instanceCount || 34, prev + 1))}
            style={{ color: 'var(--viewer-text)', padding: '0.25rem', minHeight: '32px' }}
            aria-label="Next slice"
          >
            <ChevronRight size={18} />
          </button>

          <div style={{
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--viewer-focus)',
            minWidth: '80px',
            textAlign: 'right',
          }}>
              Slice {sliceIndex} / {activeSeries?.instanceCount || 34}
          </div>
        </div>
      </main>

      {/* 3. Right Report Guide Sidebar */}
      <aside className="pacs-report-rail" style={{
        width: '380px',
        flexShrink: 0,
        backgroundColor: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--brand)" />
            <h3 style={{ fontSize: '0.9375rem', color: 'var(--ink)' }}>Report Guide</h3>
          </div>
          <span className="status-badge status-completed">4 of 4 source-linked</span>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {evidenceCards.map((card) => {
            const isRevealed = revealedWordingId === card.claimId;
            const isAdded = addedQuestions.has(card.suggestedQuestion);

            return (
              <div
                key={card.claimId}
                className="card"
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--brand)',
                  fontWeight: 700,
                  marginBottom: '0.25rem',
                }}>
                  {card.generalEducation.title} · {card.provenanceLabel}
                </div>

                <strong style={{ fontSize: '0.875rem', color: 'var(--ink)', display: 'block', marginBottom: '0.375rem' }}>
                  {card.plainEnglish}
                </strong>

                {/* Show Exact Wording Button */}
                <button
                  type="button"
                  onClick={() => setRevealedWordingId(isRevealed ? null : card.claimId)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--brand)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span>{isRevealed ? 'Hide exact wording' : 'Show exact wording'}</span>
                </button>

                {/* Revealed Exact Quotation Box */}
                {isRevealed && (
                  <div style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderLeft: '3px solid var(--brand)',
                    padding: '0.5rem 0.625rem',
                    fontSize: '0.75rem',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    marginBottom: '0.5rem',
                    borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                  }}>
                    Radiologist wrote: “{card.sourceSentence}”
                  </div>
                )}

                {/* Add to my questions button */}
                <button
                  type="button"
                  onClick={() => onAddQuestion(card.suggestedQuestion)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    width: '100%',
                    padding: '0.375rem 0.625rem',
                    backgroundColor: isAdded ? 'var(--state-completed-bg)' : 'var(--surface-subtle)',
                    color: isAdded ? 'var(--state-completed-text)' : 'var(--ink)',
                    border: `1px solid ${isAdded ? 'rgba(35,108,85,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {isAdded ? <Check size={13} /> : <Plus size={13} />}
                  <span>{isAdded ? 'Added to Appointment Pack' : 'Add to my questions'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
