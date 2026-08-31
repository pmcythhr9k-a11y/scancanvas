'use client';

import React from 'react';
import { SeriesGroup } from '@/lib/dicom/parser';
import { Layers } from 'lucide-react';

interface SeriesRailProps {
  series: SeriesGroup[];
  selectedSeriesUid: string;
  onSelectSeries: (seriesUid: string) => void;
  caseTitle?: string;
  studyDate?: string;
}

export const SeriesRail: React.FC<SeriesRailProps> = ({
  series,
  selectedSeriesUid,
  onSelectSeries,
  caseTitle = 'Left knee MRI',
  studyDate = '15 Aug 2026',
}) => {
  return (
    <aside className="pacs-series-rail" style={{
      width: '240px',
      flexShrink: 0,
      backgroundColor: 'var(--viewer-panel)',
      borderRight: '1px solid var(--viewer-divider)',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--viewer-text)',
      padding: '0.875rem 0.75rem',
      gap: '1rem',
      overflowY: 'auto',
    }}>
      {/* Case Identity */}
      <div className="rail-header">
        <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--viewer-muted)', marginBottom: '0.25rem' }}>
          Case
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--viewer-text)' }}>
          {caseTitle}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--viewer-muted)' }}>
          {studyDate} · Final report
        </div>
      </div>

      {/* Series List */}
      <div>
        <div className="rail-header" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--viewer-muted)', marginBottom: '0.5rem' }}>
          Image Series ({series.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {series.map((s) => {
            const isSelected = s.seriesInstanceUid === selectedSeriesUid;
            return (
              <button
                key={s.seriesInstanceUid}
                type="button"
                className="pacs-series-card"
                onClick={() => onSelectSeries(s.seriesInstanceUid)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.625rem',
                  backgroundColor: isSelected ? 'var(--viewer-selected)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isSelected ? 'var(--viewer-focus)' : 'var(--viewer-divider)'}`,
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--viewer-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 120ms ease',
                }}
              >
                {/* Thumbnail Preview */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#05080A',
                  border: `1px solid ${isSelected ? 'var(--viewer-focus)' : 'var(--viewer-divider)'}`,
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {s.instances?.[0]?.imageUrl ? (
                    <img
                      src={s.instances[Math.floor(s.instances.length / 2)]?.imageUrl || s.instances[0]?.imageUrl}
                      alt={s.friendlyLabel}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Layers size={16} color={isSelected ? 'var(--viewer-focus)' : 'var(--viewer-muted)'} />
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {s.friendlyLabel}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--viewer-muted)' }}>
                    {s.instanceCount} slices {s.mprEligible ? '· 3-View' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
