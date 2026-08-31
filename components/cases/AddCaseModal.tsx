'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, Folder, File, AlertCircle, Check, Loader2 } from 'lucide-react';
import { IntakeProgressEvent } from '@/lib/dicom/web-worker-client';

import JSZip from 'jszip';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessFiles: (files: Array<{ name: string; buffer: ArrayBuffer }>) => Promise<void>;
  isProcessing: boolean;
  progress: IntakeProgressEvent | null;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  isOpen,
  onClose,
  onProcessFiles,
  isProcessing,
  progress,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFiles(Array.from(e.target.files));
    }
  };

  const processSelectedFiles = async (files: File[]) => {
    const loadedFiles: Array<{ name: string; buffer: ArrayBuffer }> = [];

    for (const f of files) {
      if (f.name.toLowerCase().endsWith('.zip')) {
        try {
          const zipBuffer = await f.arrayBuffer();
          const zip = await JSZip.loadAsync(zipBuffer);
          const entries = Object.keys(zip.files);
          for (const entryPath of entries) {
            const entry = zip.files[entryPath];
            if (!entry.dir) {
              const fileBuf = await entry.async('arraybuffer');
              loadedFiles.push({
                name: entryPath,
                buffer: fileBuf,
              });
            }
          }
        } catch (zipErr) {
          console.warn('Could not unpack ZIP in-memory:', zipErr);
          const buffer = await f.arrayBuffer();
          loadedFiles.push({ name: f.name, buffer });
        }
      } else {
        const buffer = await f.arrayBuffer();
        loadedFiles.push({
          name: f.webkitRelativePath || f.name,
          buffer,
        });
      }
    }

    await onProcessFiles(loadedFiles);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-case-title">
      <div className="modal-dialog">
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 id="add-case-title" style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>
              Add an Exported MRI Case
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: '2px' }}>
              Select a disc folder, ZIP archive, or individual DICOM files
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isProcessing}
            style={{ padding: '0.25rem', minHeight: 'auto' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {isProcessing ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Loader2 size={36} color="var(--brand)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                Inspecting files locally in browser...
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginBottom: '1.5rem' }}>
                {progress ? progress.message : 'Counting images and grouping series...'}
              </p>

              {/* Progress Bar */}
              {progress && (
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{
                    height: '8px',
                    backgroundColor: 'var(--surface-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{
                      height: '100%',
                      backgroundColor: 'var(--brand)',
                      width: `${Math.min(100, (progress.processed / progress.total) * 100)}%`,
                      transition: 'width 100ms ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    Processed {progress.processed} of {progress.total} items
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--brand)' : 'var(--control-border)'}`,
                  backgroundColor: dragActive ? 'var(--brand-soft)' : 'var(--canvas)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  transition: 'all 140ms ease',
                }}
                onClick={() => folderInputRef.current?.click()}
              >
                <UploadCloud size={40} color="var(--brand)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
                  Drag and drop your MRI folder or ZIP here
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  Supports DICOM Part 10, DICOMDIR, zipped studies, and PDF/text reports
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderInputRef.current?.click();
                    }}
                    style={{ fontSize: '0.8125rem', height: '34px' }}
                  >
                    <Folder size={14} />
                    <span>Choose Folder</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{ fontSize: '0.8125rem', height: '34px' }}
                  >
                    <File size={14} />
                    <span>Choose Files</span>
                  </button>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={folderInputRef}
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory="true"
                directory="true"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />

              {/* Safe CD Notice */}
              <div style={{
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                backgroundColor: 'var(--surface-subtle)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
              }}>
                <strong>Security guarantee:</strong> ScanCanvas never executes .exe, .bat, or autorun scripts found on patient discs. Only medical DICOM images and reports are read.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
