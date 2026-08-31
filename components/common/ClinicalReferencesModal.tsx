'use client';

import React, { useState } from 'react';
import { X, ExternalLink, BookOpen, ShieldCheck, CheckCircle2, Award, Eye, Image as ImageIcon } from 'lucide-react';

interface ClinicalReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalReferencesModal: React.FC<ClinicalReferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="references-modal-title">
      <div className="modal-dialog" style={{ maxWidth: '780px' }}>
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
              <span className="status-badge status-info">Educational Attribution &amp; Citations</span>
            </div>
            <h2 id="references-modal-title" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
              Radiopaedia Case Examples &amp; Clinical Citations
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

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '68vh', overflowY: 'auto' }}>
          {/* Clinical Context Banner */}
          <div style={{
            backgroundColor: 'var(--surface-subtle)',
            borderLeft: '4px solid var(--brand)',
            padding: '0.875rem 1rem',
            borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
            fontSize: '0.8125rem',
            color: 'var(--ink)',
            lineHeight: 1.5,
          }}>
            <strong>Open Educational Clinical Context:</strong> The knee MRI imaging planes, anatomical structures, and radiological signs (e.g. pivot-shift bone contusion pattern, Blumensaat line alignment, and joint effusion) in ScanCanvas are grounded in peer-reviewed clinical educational literature and open datasets.
          </div>

          {/* Section: Real Clinical MRI Examples Gallery */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ImageIcon size={18} color="var(--brand)" />
              <h3 style={{ fontSize: '1rem', color: 'var(--ink)', fontWeight: 700 }}>
                Real Clinical MRI Examples (Radiopaedia &amp; Open Educational Repositories)
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-secondary)', marginBottom: '1rem' }}>
              These clinical reference scans demonstrate the exact anatomical findings described in the signed report and Radiopaedia teaching articles:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}>
              {/* Example 1: Sagittal T2 Knee MRI */}
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                backgroundColor: 'var(--viewer-canvas)',
              }}>
                <div style={{ position: 'relative', height: '220px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/clinical-examples/radiopaedia-acl-sagittal-t2.jpg"
                    alt="Clinical Sagittal Knee MRI showing ACL and PCL anatomy"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(12, 21, 27, 0.85)',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    padding: '2px 6px',
                    borderRadius: '2px',
                  }}>
                    Sagittal Plane · ACL Trajectory &amp; PCL Arc
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface)' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--ink)', display: 'block' }}>
                    Sagittal T2 FS Knee MRI
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    Demonstrates the normal vs disrupted ACL fiber trajectory parallel to Blumensaat's line and the continuous low-signal arc of the intact posterior cruciate ligament (PCL).
                  </p>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
                    Source: Radiopaedia / Wikimedia Commons (Educational CC License)
                  </div>
                </div>
              </div>

              {/* Example 2: Coronal Knee MRI */}
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                backgroundColor: 'var(--viewer-canvas)',
              }}>
                <div style={{ position: 'relative', height: '220px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/clinical-examples/radiopaedia-acl-coronal-segond.jpg"
                    alt="Clinical Coronal Knee MRI showing lateral joint compartment and ACL injury signs"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(12, 21, 27, 0.85)',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    padding: '2px 6px',
                    borderRadius: '2px',
                  }}>
                    Coronal Plane · Lateral Joint Compartment
                  </div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface)' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--ink)', display: 'block' }}>
                    Coronal Proton Density (PD) Knee MRI
                  </strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    Shows the intercondylar notch ("Empty Notch Sign" in complete disruptions), femoral condyle cortex, and tibial plateau articular surface.
                  </p>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginTop: '0.375rem' }}>
                    Source: Radiopaedia / Wikimedia Commons (Educational CC License)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reference 1: Radiopaedia Article */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)', display: 'block' }}>
                  Radiopaedia.org — Anterior Cruciate Ligament Tear
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  By Dr. Frank Gaillard, Dr. Henry Knipe et al. (Reference Article 10927)
                </span>
              </div>
              <a
                href="https://radiopaedia.org/articles/anterior-cruciate-ligament-tear?lang=gb"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', textDecoration: 'none' }}
              >
                <span>View on Radiopaedia</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Comprehensive radiological reference detailing sagittal discontinuity of fibers, Blumensaat line angle, empty notch sign, and pivot-shift bone contusion patterns in the lateral femoral condyle and posterior lateral tibial plateau.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              License: Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA 3.0)
            </div>
          </div>

          {/* Reference 2: Stanford AIMI & KneeMRI Dataset */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)', display: 'block' }}>
                  Clinical Hospital Centre Rijeka / KneeMRI Benchmark
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Štajduhar et al. — Zenodo (Record 4505353) / Kaggle
                </span>
              </div>
              <a
                href="https://zenodo.org/records/4505353"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', textDecoration: 'none' }}
              >
                <span>Zenodo Record</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Open knee MRI collection with clinical annotations for anterior cruciate ligament status (healthy, partial tear, complete rupture) across standard diagnostic sequences.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              License: Creative Commons Attribution-NonCommercial-NoDerivatives (CC BY-NC-ND 4.0)
            </div>
          </div>

          {/* Reference 3: Mendeley Data ACL-PCL Dataset */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)', display: 'block' }}>
                  Mendeley Data ACL-PCL Multi-View Knee Dataset
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Multi-axial, coronal, and sagittal knee MRI database
                </span>
              </div>
              <a
                href="https://data.mendeley.com/datasets/x8m3z9w92m/1"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', textDecoration: 'none' }}
              >
                <span>Mendeley Data</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Curated clinical knee MRI scans labeled across coronal, axial, and sagittal planes for cruciate ligament evaluation.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              License: Creative Commons Attribution 4.0 International (CC BY 4.0)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            <span>Close References</span>
          </button>
        </div>
      </div>
    </div>
  );
};
