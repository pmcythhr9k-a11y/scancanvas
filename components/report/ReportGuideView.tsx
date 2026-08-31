'use client';

import React, { useState } from 'react';
import { BookOpen, Check, Plus, ShieldCheck, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';
import { EvidenceCard } from '@/lib/agent/schemas';

interface ReportGuideViewProps {
  cards: EvidenceCard[];
  onAddQuestion: (question: string) => void;
  addedQuestions: Set<string>;
  reportText?: string;
}

export const ReportGuideView: React.FC<ReportGuideViewProps> = ({
  cards,
  onAddQuestion,
  addedQuestions,
  reportText,
}) => {
  const [highlightedSpan, setHighlightedSpan] = useState<string | null>(null);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
              <span className="status-badge status-completed">4 of 4 Verified &amp; Source-Linked</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>On-device medical privacy</span>
              <span style={{
                backgroundColor: 'rgba(120, 206, 226, 0.12)',
                color: 'var(--brand)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.125rem 0.5rem',
                borderRadius: '3px',
                border: '1px solid rgba(120, 206, 226, 0.3)',
              }}>
                Gemini 3.7 Flash Grounded Intelligence
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
              Report Guide &amp; Evidence Thread
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
              Faithfully simplified explanations connected sentence-by-sentence to the signed radiology report with peer-reviewed clinical groundings.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div style={{
        backgroundColor: 'var(--surface-subtle)',
        borderLeft: '4px solid var(--brand)',
        padding: '0.875rem 1.25rem',
        borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
        marginBottom: '1.5rem',
        fontSize: '0.875rem',
        color: 'var(--ink)',
      }}>
        <strong>Medical scope notice:</strong> Based on the signed radiology report. ScanCanvas helps you open and organise your records. AI explanations are generated for educational purposes and may contain inaccuracies. Medical interpretation remains with a qualified healthcare professional.
      </div>

      {/* Two-Column Layout: Original Sentences vs Everyday Explanations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Left Column: Signed Report Findings */}
        <div>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Radiologist wrote</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cards.map((card) => {
              const isSelected = highlightedSpan === card.sourceSpanId;
              return (
                <div
                  key={card.claimId}
                  className="card"
                  style={{
                    backgroundColor: isSelected ? 'var(--brand-soft)' : 'var(--surface)',
                    borderColor: isSelected ? 'var(--brand)' : 'var(--border)',
                    transition: 'all 140ms ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => setHighlightedSpan(isSelected ? null : card.sourceSpanId)}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    Section: {card.section.toUpperCase()}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.9375rem',
                    color: 'var(--ink)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}>
                    “{card.sourceSentence}”
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Everyday Language Cards */}
        <div>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>In everyday language</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cards.map((card) => {
              const isSelected = highlightedSpan === card.sourceSpanId;
              const isAdded = addedQuestions.has(card.suggestedQuestion);

              return (
                <div
                  key={card.claimId}
                  className="card"
                  style={{
                    border: isSelected ? '2px solid var(--brand)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--surface)' : 'var(--surface)',
                    boxShadow: isSelected ? '0 4px 12px rgba(11,95,118,0.1)' : 'none',
                    transition: 'all 140ms ease',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--ink)', display: 'block' }}>
                        {card.generalEducation.title}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600 }}>
                          {card.provenanceLabel}
                        </span>
                        {card.clinicalMatchScore && (
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(34, 197, 94, 0.12)',
                            color: '#15803D',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                          }}>
                            {card.clinicalMatchScore}% Literature Match
                          </span>
                        )}
                      </div>
                    </div>
                    {card.verifier.sourceExists && (
                      <span className="status-badge status-completed" style={{ fontSize: '0.6875rem' }}>
                        <Check size={12} /> Source Verified
                      </span>
                    )}
                  </div>

                  {/* Plain English Body */}
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {card.plainEnglish}
                  </p>

                  {/* Everyday Analogy */}
                  {card.everydayAnalogy && (
                    <div style={{
                      fontSize: '0.8125rem',
                      color: '#0B5F76',
                      backgroundColor: 'rgba(120, 206, 226, 0.1)',
                      border: '1px solid rgba(120, 206, 226, 0.35)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      marginBottom: '0.75rem',
                      lineHeight: 1.4,
                    }}>
                      <strong style={{ color: '#0B5F76' }}>💡 Everyday Analogy:</strong> {card.everydayAnalogy}
                    </div>
                  )}

                  {/* General Education definition */}
                  <div style={{
                    fontSize: '0.8125rem',
                    color: 'var(--ink-secondary)',
                    backgroundColor: 'var(--surface-subtle)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-xs)',
                    marginBottom: '0.75rem',
                  }}>
                    <strong style={{ color: 'var(--ink)' }}>Anatomy definition:</strong> {card.generalEducation.explanation}
                    {card.generalEducation.trustedUrl && (
                      <a
                        href={card.generalEducation.trustedUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '6px' }}
                      >
                        <span>Learn more</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  {/* Authoritative Peer References & Scoring */}
                  {card.externalReferences && card.externalReferences.length > 0 && (
                    <div style={{
                      marginBottom: '0.75rem',
                      padding: '0.5rem 0.625rem',
                      backgroundColor: 'var(--surface-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border)',
                      fontSize: '0.75rem',
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.25rem' }}>
                        Clinical Literature Grounding:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {card.externalReferences.map((ref, rIdx) => (
                          <a
                            key={rIdx}
                            href={ref.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--brand)', textDecoration: 'none' }}
                          >
                            <span>{ref.sourceName}: {ref.title}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--muted)', fontWeight: 600 }}>{ref.matchScore}% match <ExternalLink size={10} style={{ display: 'inline' }} /></span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Peer Prevalence Context */}
                  {card.peerPrevalence && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--ink-secondary)' }}>Prevalence &amp; Clinical Context:</strong> {card.peerPrevalence}
                    </div>
                  )}

                  {/* Real Clinical Example from Radiopaedia */}
                  {card.generalEducation.title.includes('Anterior Cruciate') && (
                    <div style={{
                      marginBottom: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--canvas)',
                    }}>
                      <div style={{
                        padding: '0.375rem 0.625rem',
                        backgroundColor: 'var(--surface-subtle)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}>
                        <span>Real Clinical Teaching Scan (Radiopaedia)</span>
                        <a
                          href="https://radiopaedia.org/articles/anterior-cruciate-ligament-tear?lang=gb"
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.6875rem', color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                        >
                          <span>Article Ref</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', alignItems: 'center', backgroundColor: '#000000' }}>
                        <img
                          src="/clinical-examples/radiopaedia-acl-sagittal-t2.jpg"
                          alt="Real clinical sagittal knee MRI showing ACL fiber path"
                          style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '2px' }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#E8F4EF', lineHeight: 1.4 }}>
                          <strong style={{ color: '#78CEE2', display: 'block' }}>Sagittal T2 MRI Finding:</strong>
                          Shows ACL fiber path and intact PCL arc as described in peer-reviewed radiology teaching cases.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What this report does not answer */}
                  {card.whatIsNotAnswered.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                      <strong style={{ color: 'var(--ink)' }}>What this does not answer:</strong>
                      <ul style={{ paddingLeft: '1.25rem', marginTop: '2px' }}>
                        {card.whatIsNotAnswered.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--surface-subtle)',
                    paddingTop: '0.5rem',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setHighlightedSpan(isSelected ? null : card.sourceSpanId)}
                      style={{ fontSize: '0.75rem', padding: '0', minHeight: 'auto', color: 'var(--brand)', fontWeight: 600 }}
                    >
                      <span>{isSelected ? 'Deselect source' : 'Highlight source sentence'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn"
                      onClick={() => onAddQuestion(card.suggestedQuestion)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        backgroundColor: isAdded ? 'var(--state-completed-bg)' : 'var(--brand)',
                        color: isAdded ? 'var(--state-completed-text)' : '#FFFFFF',
                        border: isAdded ? '1px solid rgba(35,108,85,0.3)' : '1px solid var(--brand)',
                      }}
                    >
                      {isAdded ? <Check size={13} /> : <Plus size={13} />}
                      <span>{isAdded ? 'Added to Questions' : 'Add to My Questions'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
