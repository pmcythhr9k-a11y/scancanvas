'use client';

import React, { useRef, useEffect } from 'react';
import { ParsedDicomInstance } from '@/lib/dicom/parser';

interface ViewportStackProps {
  instance: ParsedDicomInstance | null;
  planeLabel?: string;
  orientationText?: string;
  zoom: number;
  pan: { x: number; y: number };
  brightness: number; // -100 .. 100
  contrast: number;   // -100 .. 100
  activeTool: 'scroll' | 'zoom' | 'pan' | 'contrast';
  onWheelSlice?: (delta: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
  onContrastChange?: (brightness: number, contrast: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export const ViewportStack: React.FC<ViewportStackProps> = ({
  instance,
  planeLabel = 'Side view · Sagittal',
  orientationText = 'H → F',
  zoom,
  pan,
  brightness,
  contrast,
  activeTool,
  onWheelSlice,
  onPanChange,
  onContrastChange,
  onZoomChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Render DICOM slice to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !instance) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- CASE 1: Image URL (e.g. Local Demo Knee Stack) ---
    if (instance.imageUrl) {
      const renderImg = (img: HTMLImageElement) => {
        const rows = instance.metadata.rows || img.naturalHeight || img.height || 512;
        const cols = instance.metadata.columns || img.naturalWidth || img.width || 512;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Apply visual windowing via CSS filters
        const bFilter = Math.max(0, 100 + brightness);
        const cFilter = Math.max(0, 100 + (contrast * 1.5));
        ctx.filter = `brightness(${bFilter}%) contrast(${cFilter}%) grayscale(100%)`;

        const baseScale = Math.min(canvas.width / cols, canvas.height / rows) * 0.88;
        const finalScale = zoom * baseScale;

        // Pan & Zoom
        ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
        ctx.scale(finalScale, finalScale);
        ctx.translate(-cols / 2, -rows / 2);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, cols, rows);
        ctx.restore();
      };

      const cached = (window as unknown as { _mriImgCache?: Map<string, HTMLImageElement> })._mriImgCache?.get(instance.imageUrl);
      if (cached && cached.complete) {
        renderImg(cached);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!((window as unknown as { _mriImgCache?: Map<string, HTMLImageElement> })._mriImgCache)) {
          (window as unknown as { _mriImgCache?: Map<string, HTMLImageElement> })._mriImgCache = new Map();
        }
        (window as unknown as { _mriImgCache?: Map<string, HTMLImageElement> })._mriImgCache!.set(instance.imageUrl!, img);
        renderImg(img);
      };
      img.onerror = () => {
        console.warn('Failed to load image slice:', instance.imageUrl);
      };
      img.src = instance.imageUrl;
      return;
    }

    // --- CASE 2: Raw DICOM Pixel Data ---
    const rows = instance.metadata.rows || 256;
    const cols = instance.metadata.columns || 256;

    const imgData = ctx.createImageData(cols, rows);
    const data = imgData.data;
    const rawPixels = instance.pixelData;

    let minVal = 0;
    let maxVal = 4095;

    if (rawPixels && rawPixels.length > 0) {
      let calcMin = Infinity;
      let calcMax = -Infinity;
      for (let i = 0; i < rawPixels.length; i++) {
        const val = rawPixels[i];
        if (val < calcMin) calcMin = val;
        if (val > calcMax) calcMax = val;
      }
      minVal = calcMin;
      maxVal = calcMax;
    }

    const windowFactor = Math.pow(2, contrast / 50);
    const range = (maxVal - minVal) / windowFactor || 1;
    const centerShift = (brightness / 100) * (maxVal - minVal);
    const effectiveMin = minVal + centerShift;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        let gray = 0;

        if (rawPixels && idx < rawPixels.length) {
          const raw = rawPixels[idx];
          const norm = Math.max(0, Math.min(1, (raw - effectiveMin) / range));
          gray = Math.floor(norm * 255);
        } else {
          gray = 15; // Dark background fallback
        }

        const outIdx = idx * 4;
        data[outIdx] = gray;
        data[outIdx + 1] = gray;
        data[outIdx + 2] = gray;
        data[outIdx + 3] = 255;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const baseScale = Math.min(canvas.width / cols, canvas.height / rows) * 0.88;
    const finalScale = zoom * baseScale;

    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(finalScale, finalScale);
    ctx.translate(-cols / 2, -rows / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0);
    }

    ctx.restore();
  }, [instance, zoom, pan, brightness, contrast]);

  // Mouse wheel scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (onWheelSlice) {
      onWheelSlice(e.deltaY > 0 ? 1 : -1);
    }
  };

  // Mouse drag handlers based on active tool
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (activeTool === 'scroll' && onWheelSlice) {
      if (Math.abs(dy) >= 5) {
        onWheelSlice(dy > 0 ? 1 : -1);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    } else {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      if (activeTool === 'pan' && onPanChange) {
        onPanChange({ x: pan.x + dx, y: pan.y + dy });
      } else if (activeTool === 'zoom' && onZoomChange) {
        const zoomFactor = 1 - dy * 0.01;
        onZoomChange(Math.max(0.4, Math.min(5.0, zoom * zoomFactor)));
      } else if (activeTool === 'contrast' && onContrastChange) {
        onContrastChange(
          Math.max(-100, Math.min(100, brightness + dx * 0.5)),
          Math.max(-100, Math.min(100, contrast - dy * 0.5))
        );
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--viewer-canvas)',
        overflow: 'hidden',
        cursor:
          activeTool === 'pan'
            ? 'grab'
            : activeTool === 'zoom'
            ? 'zoom-in'
            : activeTool === 'contrast'
            ? 'ew-resize'
            : 'ns-resize',
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={540}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
        }}
      />

      {/* Top Left Plane Label */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: 'rgba(17, 31, 39, 0.85)',
        color: 'var(--viewer-text)',
        padding: '0.25rem 0.5rem',
        borderRadius: '2px',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid var(--viewer-divider)',
        pointerEvents: 'none',
      }}>
        {planeLabel}
      </div>

      {/* Top Right Orientation Indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        backgroundColor: 'rgba(17, 31, 39, 0.85)',
        color: 'var(--viewer-focus)',
        padding: '0.25rem 0.5rem',
        borderRadius: '2px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.05em',
        border: '1px solid var(--viewer-divider)',
        pointerEvents: 'none',
      }}>
        {orientationText}
      </div>

      {/* Bottom Center Informational Notice */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'var(--viewer-muted)',
        fontSize: '0.6875rem',
        pointerEvents: 'none',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}>
        {instance?.imageUrl 
          ? "Case courtesy of Radiopaedia.org, licensed CC BY-NC-SA 3.0. Images via NC Commons." 
          : "Informational Scan Viewer — Not for diagnostic use"}
      </div>
    </div>
  );
};
