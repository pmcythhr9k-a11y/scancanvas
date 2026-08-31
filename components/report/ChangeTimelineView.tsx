'use client';

import React from 'react';
import { GitCompare, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ChangeTimelineItem } from '@/lib/agent/schemas';

interface ChangeTimelineViewProps {
  earlierDate?: string;
  currentDate?: string;
}

const DEFAULT_TIMELINE_ITEMS: ChangeTimelineItem[] = [
  {
    id: 'change-001-acl',
    finding: 'Anterior Cruciate Ligament (ACL)',
    earlierDate: '03 Mar 2025',
    earlierQuote: 'The anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) are intact with normal continuous low signal trajectory.',
    currentDate: '15 Aug 2026',
    currentQuote: 'High-grade partial thickness tear of the anterior cruciate ligament with discontinuous mid-substance fibres and oedema.',
    classification: 'newly_mentioned',
    plainExplanation: 'The prior 2025 report explicitly described an intact ligament. The current 2026 report newly mentions a high-grade partial tear.',
    isRefusal: false,
  },
  {
    id: 'change-002-bone-marrow',
    finding: 'Bone Marrow Oedema / Contusion',
    earlierDate: '03 Mar 2025',
    earlierQuote: 'No focal bone contusion or marrow oedema identified.',
    currentDate: '15 Aug 2026',
    currentQuote: 'Bone marrow oedema within the lateral femoral condyle and posterior lateral tibial plateau, likely reflecting an impaction bone contusion.',
    classification: 'newly_mentioned',
    plainExplanation: 'The prior report noted no bone contusion. The current report newly describes reactive bone marrow edema following acute twisting trauma.',
    isRefusal: false,
  },
  {
    id: 'change-003-meniscus-refusal',
    finding: 'Meniscal Morphology Comparison',
    earlierDate: '03 Mar 2025',
    earlierQuote: 'Grossly intact menisci.',
    currentDate: '15 Aug 2026',
    currentQuote: 'No displaced or complex meniscal tear is identified. The medial and lateral meniscal bodies demonstrate normal low signal morphology without surface disruption.',
    classification: 'not_safely_comparable',
    plainExplanation: 'Meniscal wording cannot be compared reliably. The earlier report used a generalized summary ("Grossly intact"), while the current report provides specific anatomical sub-compartment detail. The system conservatively refuses to over-interpret slight phrasing variations as clinical changes.',
    isRefusal: true,
    refusalReason: 'Level of descriptive detail differs significantly between reports.',
  },
];

export const ChangeTimelineView: React.FC<ChangeTimelineViewProps> = ({
  earlierDate = '03 March 2025',
  currentDate = '15 August 2026',
}) => {
  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="status-badge status-attention">1 Item Not Safely Comparable (Conservative Refusal)</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
              Report Change Timeline
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
              Neutral source-linked comparison between prior scan ({earlierDate}) and current scan ({currentDate}).
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{
        backgroundColor: 'var(--surface-subtle)',
        borderLeft: '4px solid var(--brand)',
        padding: '0.875rem 1.25rem',
        borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
        marginBottom: '1.5rem',
        fontSize: '0.875rem',
        color: 'var(--ink)',
      }}>
        <strong>Conservative comparison rule:</strong> ScanCanvas avoids assuming that wording changes represent medical improvement or worsening. When wording or technique differs, the system returns a safe refusal rather than guessing.
      </div>

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {DEFAULT_TIMELINE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              padding: '1.25rem',
              borderLeft: item.isRefusal ? '4px solid var(--state-attention-text)' : '4px solid var(--brand)',
            }}
          >
            {/* Finding Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.0625rem', color: 'var(--ink)' }}>{item.finding}</strong>
              {item.isRefusal ? (
                <span className="status-badge status-attention">
                  <ShieldAlert size={13} /> Not Safely Comparable
                </span>
              ) : (
                <span className="status-badge status-completed">
                  <CheckCircle2 size={13} /> Newly Mentioned Finding
                </span>
              )}
            </div>

            {/* Plain explanation */}
            <p style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5, marginBottom: '1rem' }}>
              {item.plainExplanation}
            </p>

            {/* Side by side quotations */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              backgroundColor: 'var(--surface-subtle)',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.25rem' }}>
                  PRIOR REPORT ({item.earlierDate}):
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--ink)', fontFamily: 'var(--font-serif)' }}>
                  “{item.earlierQuote}”
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.25rem' }}>
                  CURRENT REPORT ({item.currentDate}):
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--ink)', fontFamily: 'var(--font-serif)' }}>
                  “{item.currentQuote}”
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
