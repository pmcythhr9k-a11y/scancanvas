'use client';

import React, { useState } from 'react';
import { PackageCheck, Download, Printer, Plus, Trash2, Edit2, Check, ShieldCheck, FileText } from 'lucide-react';
import { CaseManifest } from '@/lib/dicom/parser';
import { EvidenceCard, PrivacyReceipt } from '@/lib/agent/schemas';
import { AppointmentQuestion, buildAppointmentPackZip } from '@/lib/export/appointment-pack';

interface AppointmentPackViewProps {
  manifest: CaseManifest;
  privacyReceipt: PrivacyReceipt;
  evidenceCards: EvidenceCard[];
  questions: AppointmentQuestion[];
  onUpdateQuestions: (questions: AppointmentQuestion[]) => void;
  originalFiles?: Array<{ name: string; buffer: ArrayBuffer }>;
}

export const AppointmentPackView: React.FC<AppointmentPackViewProps> = ({
  manifest,
  privacyReceipt,
  evidenceCards,
  questions,
  onUpdateQuestions,
  originalFiles,
}) => {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Add question
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: AppointmentQuestion = {
      id: `q-custom-${Date.now()}`,
      text: newQuestionText.trim(),
      enabled: true,
    };
    onUpdateQuestions([...questions, newQ]);
    setNewQuestionText('');
  };

  // Toggle question enabled
  const handleToggleQuestion = (id: string) => {
    onUpdateQuestions(
      questions.map((q) => (q.id === id ? { ...q, enabled: !q.enabled } : q))
    );
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    onUpdateQuestions(questions.filter((q) => q.id !== id));
  };

  // Save edit
  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateQuestions(
      questions.map((q) => (q.id === id ? { ...q, text: editText.trim() } : q))
    );
    setEditingId(null);
  };

  // Download ZIP
  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const zipBlob = await buildAppointmentPackZip({
        manifest,
        privacyReceipt,
        evidenceCards,
        questions,
        includeOriginalDicom: true,
        originalFiles,
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ScanCanvas-Appointment-Pack-${manifest.caseId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating ZIP:', err);
      alert('Error creating appointment pack ZIP.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Print brief
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="status-badge status-completed">Ready for Download &amp; Print</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
              Appointment Pack Builder
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
              Customise your appointment questions and generate a local, verifiable consultation package.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrint}
            >
              <Printer size={16} />
              <span>Print Brief</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadZip}
              disabled={isDownloading}
            >
              <Download size={16} />
              <span>{isDownloading ? 'Building Package...' : 'Download Complete Case (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Package Contents Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>PACK CONTENTS</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', marginTop: '0.25rem' }}>
            6 Components Included
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            Brief HTML, Original Report, Questions, Manifest, Privacy Receipt, SHA256SUMS
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>IMAGE OBJECTS</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', marginTop: '0.25rem' }}>
            {manifest.instancesReadable} DICOM Files
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            Original uncompressed byte stream preserved bit-for-bit
          </p>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>ACTIVE QUESTIONS</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ink)', marginTop: '0.25rem' }}>
            {questions.filter((q) => q.enabled).length} Prepared Questions
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            Ready for your doctor consultation
          </p>
        </div>
      </div>

      {/* Section: Appointment Questions Editor */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--ink)' }}>
          1. Questions for Your Next Consultation
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: q.enabled ? 'var(--surface)' : 'var(--surface-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                opacity: q.enabled ? 1 : 0.6,
              }}
            >
              <input
                type="checkbox"
                checked={q.enabled}
                onChange={() => handleToggleQuestion(q.id)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand)', cursor: 'pointer' }}
                aria-label="Include question"
              />

              <div style={{ flex: 1 }}>
                {editingId === q.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.375rem 0.625rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--brand)',
                        fontSize: '0.875rem',
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveEdit(q.id)}
                      style={{ height: '32px', padding: '0 0.625rem' }}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.9375rem', color: 'var(--ink)', fontWeight: 500 }}>
                    {idx + 1}. {q.text}
                  </span>
                )}
              </div>

              {editingId !== q.id && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setEditingId(q.id);
                      setEditText(q.text);
                    }}
                    style={{ padding: '0.25rem', minHeight: 'auto', color: 'var(--muted)' }}
                    title="Edit question text"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleDeleteQuestion(q.id)}
                    style={{ padding: '0.25rem', minHeight: 'auto', color: 'var(--state-error-text)' }}
                    title="Remove question"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Question Field */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Type an additional question for your doctor..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddQuestion();
            }}
            style={{
              flex: 1,
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddQuestion}
            disabled={!newQuestionText.trim()}
          >
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Section: Live Printable Brief Preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', color: 'var(--ink)' }}>
            2. Appointment Brief Preview
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>High-contrast print ready</span>
        </div>

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xs)',
          padding: '1.5rem',
          backgroundColor: '#FFFFFF',
          color: 'var(--ink)',
        }}>
          <div style={{ borderBottom: '2px solid var(--ink)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--brand)' }}>
                ScanCanvas — Appointment Brief
              </h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                Left Knee MRI · {manifest.studyDate} · Patient: Demo (Synthetic)
              </div>
            </div>
            <span className="status-badge status-completed">Zero Pixels Sent</span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
              Prepared Questions:
            </strong>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {questions
                .filter((q) => q.enabled)
                .map((q, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>{q.text}</li>
                ))}
            </ol>
          </div>

          <div>
            <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
              Report-Backed Evidence Cards:
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {evidenceCards.map((c, i) => (
                <div key={i} style={{ backgroundColor: 'var(--surface-subtle)', padding: '0.625rem 0.75rem', borderRadius: '2px', fontSize: '0.8125rem', borderLeft: '3px solid var(--brand)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <strong>{c.generalEducation.title}</strong>
                    {c.clinicalMatchScore && (
                      <span style={{ fontSize: '0.6875rem', color: '#15803D', fontWeight: 600 }}>
                        {c.clinicalMatchScore}% Literature Match
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--ink)', marginBottom: '4px' }}>{c.plainEnglish}</div>
                  {c.everydayAnalogy && (
                    <div style={{ fontSize: '0.75rem', color: '#0B5F76', marginBottom: '4px' }}>
                      <em>Analogy:</em> {c.everydayAnalogy}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    Radiologist wrote: “{c.sourceSentence}”
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
