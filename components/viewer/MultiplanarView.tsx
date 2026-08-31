'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Volume3D, extractOrthogonalSlice } from '@/lib/dicom/geometry';
import { ParsedDicomInstance } from '@/lib/dicom/parser';

interface MultiplanarViewProps {
  volume: Volume3D | null;
  currentSliceIndex: number;
  onSliceChange: (sliceIdx: number) => void;
  instances: ParsedDicomInstance[];
}

export const MultiplanarView: React.FC<MultiplanarViewProps> = ({
  volume,
  currentSliceIndex,
  onSliceChange,
  instances,
}) => {
  const sagittalCanvasRef = useRef<HTMLCanvasElement>(null);
  const coronalCanvasRef = useRef<HTMLCanvasElement>(null);
  const axialCanvasRef = useRef<HTMLCanvasElement>(null);

  const [sagittalSlice, setSagittalSlice] = useState(currentSliceIndex);
  const [coronalSlice, setCoronalSlice] = useState(16);
  const [axialSlice, setAxialSlice] = useState(18);

  // Synchronize sagittal slice with main control
  useEffect(() => {
    setSagittalSlice(currentSliceIndex);
  }, [currentSliceIndex]);

  // Render 3 orthogonal viewports
  useEffect(() => {
    if (!volume) return;

    // 1. Sagittal Viewport (Side View)
    if (sagittalCanvasRef.current) {
      const ctx = sagittalCanvasRef.current.getContext('2d');
      if (ctx) {
        const pixels = extractOrthogonalSlice(volume, 'sagittal', sagittalSlice, 320, 260);
        const imgData = ctx.createImageData(320, 260);
        imgData.data.set(pixels);
        ctx.putImageData(imgData, 0, 0);

        // Draw crosshairs
        ctx.strokeStyle = 'rgba(120, 206, 226, 0.6)';
        ctx.lineWidth = 1;
        // Horizontal (axial level)
        const yPos = (axialSlice / 38) * 260;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(320, yPos);
        ctx.stroke();
        // Vertical (coronal level)
        const xPos = (coronalSlice / 32) * 320;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, 260);
        ctx.stroke();
      }
    }

    // 2. Coronal Viewport (Front View)
    if (coronalCanvasRef.current) {
      const ctx = coronalCanvasRef.current.getContext('2d');
      if (ctx) {
        const pixels = extractOrthogonalSlice(volume, 'coronal', coronalSlice, 320, 260);
        const imgData = ctx.createImageData(320, 260);
        imgData.data.set(pixels);
        ctx.putImageData(imgData, 0, 0);

        // Draw crosshairs
        ctx.strokeStyle = 'rgba(120, 206, 226, 0.6)';
        ctx.lineWidth = 1;
        // Horizontal (axial level)
        const yPos = (axialSlice / 38) * 260;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(320, yPos);
        ctx.stroke();
        // Vertical (sagittal level)
        const xPos = (sagittalSlice / Math.max(1, volume.dimensions[2])) * 320;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, 260);
        ctx.stroke();
      }
    }

    // 3. Axial Viewport (Cross-section)
    if (axialCanvasRef.current) {
      const ctx = axialCanvasRef.current.getContext('2d');
      if (ctx) {
        const pixels = extractOrthogonalSlice(volume, 'axial', axialSlice, 320, 260);
        const imgData = ctx.createImageData(320, 260);
        imgData.data.set(pixels);
        ctx.putImageData(imgData, 0, 0);

        // Draw crosshairs
        ctx.strokeStyle = 'rgba(120, 206, 226, 0.6)';
        ctx.lineWidth = 1;
        // Horizontal (coronal level)
        const yPos = (coronalSlice / 32) * 260;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(320, yPos);
        ctx.stroke();
        // Vertical (sagittal level)
        const xPos = (sagittalSlice / Math.max(1, volume.dimensions[2])) * 320;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, 260);
        ctx.stroke();
      }
    }
  }, [volume, sagittalSlice, coronalSlice, axialSlice]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--viewer-canvas)',
      padding: '0.75rem',
      gap: '0.75rem',
    }}>
      {/* Reconstruction Notice */}
      <div style={{
        backgroundColor: 'var(--viewer-panel)',
        border: '1px solid var(--viewer-divider)',
        borderRadius: '2px',
        padding: '0.375rem 0.75rem',
        color: 'var(--viewer-muted)',
        fontSize: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>
          <strong>Three-View Reconstruction:</strong> Orthogonal views generated from parallel 3D voxel matrix.
        </span>
        <span style={{ color: 'var(--viewer-focus)', fontWeight: 600 }}>Synchronized Crosshairs</span>
      </div>

      {/* 3 Viewports Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.75rem',
        flex: 1,
      }}>
        {/* Sagittal Viewport */}
        <div style={{
          backgroundColor: 'var(--viewer-panel)',
          border: '1px solid var(--viewer-divider)',
          borderRadius: '2px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(17, 31, 39, 0.85)',
            color: 'var(--viewer-text)',
            fontSize: '0.6875rem',
            padding: '0.2rem 0.4rem',
            borderRadius: '2px',
            border: '1px solid var(--viewer-divider)',
            zIndex: 2,
          }}>
            Side view (Sagittal) · H &rarr; F
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas ref={sagittalCanvasRef} width={320} height={260} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ padding: '0.375rem 0.75rem', borderTop: '1px solid var(--viewer-divider)' }}>
            <input
              type="range"
              min={1}
              max={instances.length || 34}
              value={sagittalSlice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSagittalSlice(val);
                onSliceChange(val);
              }}
              style={{ width: '100%' }}
              aria-label="Sagittal slice"
            />
          </div>
        </div>

        {/* Coronal Viewport */}
        <div style={{
          backgroundColor: 'var(--viewer-panel)',
          border: '1px solid var(--viewer-divider)',
          borderRadius: '2px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(17, 31, 39, 0.85)',
            color: 'var(--viewer-text)',
            fontSize: '0.6875rem',
            padding: '0.2rem 0.4rem',
            borderRadius: '2px',
            border: '1px solid var(--viewer-divider)',
            zIndex: 2,
          }}>
            Front view (Coronal) · R &middot; L
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas ref={coronalCanvasRef} width={320} height={260} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ padding: '0.375rem 0.75rem', borderTop: '1px solid var(--viewer-divider)' }}>
            <input
              type="range"
              min={1}
              max={32}
              value={coronalSlice}
              onChange={(e) => setCoronalSlice(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
              aria-label="Coronal slice"
            />
          </div>
        </div>

        {/* Axial Viewport */}
        <div style={{
          backgroundColor: 'var(--viewer-panel)',
          border: '1px solid var(--viewer-divider)',
          borderRadius: '2px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: 'rgba(17, 31, 39, 0.85)',
            color: 'var(--viewer-text)',
            fontSize: '0.6875rem',
            padding: '0.2rem 0.4rem',
            borderRadius: '2px',
            border: '1px solid var(--viewer-divider)',
            zIndex: 2,
          }}>
            Cross-section (Axial) · A &middot; P
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas ref={axialCanvasRef} width={320} height={260} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ padding: '0.375rem 0.75rem', borderTop: '1px solid var(--viewer-divider)' }}>
            <input
              type="range"
              min={1}
              max={38}
              value={axialSlice}
              onChange={(e) => setAxialSlice(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
              aria-label="Axial slice"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
