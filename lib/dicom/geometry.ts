// DICOM Volume Geometry and Orthogonal Multiplanar Reconstruction (MPR) Engine

import { ParsedDicomInstance } from './parser';

export interface Volume3D {
  dimensions: [number, number, number]; // [width (X), height (Y), depth (Z)]
  spacing: [number, number, number];    // [dx, dy, dz] in mm
  origin: [number, number, number];     // [x0, y0, z0]
  data: Float32Array;                   // normalized 0..1 voxel intensity array
  sourcePlane: 'sagittal' | 'coronal' | 'axial';
}

export interface MprEligibilityResult {
  eligible: boolean;
  reason?: string;
  sliceCount: number;
  regularSpacingMm?: number;
}

/**
 * Check if a series of DICOM slices qualifies for 3D Multiplanar Reconstruction
 */
export function checkMprEligibility(instances: ParsedDicomInstance[]): MprEligibilityResult {
  if (!instances || instances.length < 10) {
    return {
      eligible: false,
      reason: `Insufficient slice depth (${instances?.length || 0} slices). Standard MPR requires at least 10 parallel slices.`,
      sliceCount: instances?.length || 0,
    };
  }

  // Check consistent matrix size
  const first = instances[0].metadata;
  const rows = first.rows;
  const cols = first.columns;

  for (let i = 1; i < instances.length; i++) {
    const meta = instances[i].metadata;
    if (meta.rows !== rows || meta.columns !== cols) {
      return {
        eligible: false,
        reason: 'Inconsistent slice dimensions across the series.',
        sliceCount: instances.length,
      };
    }
  }

  // Check orientation vectors
  if (!first.imageOrientationPatient || first.imageOrientationPatient.length !== 6) {
    return {
      eligible: true, // fallback to ordered slice stack
      sliceCount: instances.length,
      regularSpacingMm: 3.0,
    };
  }

  // Check slice position progression
  const withPos = instances.filter((inst) => inst.metadata.imagePositionPatient);
  if (withPos.length >= instances.length * 0.8) {
    // Sort by normal axis position
    const [x1, y1, z1, x2, y2, z2] = first.imageOrientationPatient;
    const normal = [
      y1 * z2 - z1 * y2,
      z1 * x2 - x1 * z2,
      x1 * y2 - y1 * x2,
    ];

    const distances = withPos.map((inst) => {
      const pos = inst.metadata.imagePositionPatient!;
      return pos[0] * normal[0] + pos[1] * normal[1] + pos[2] * normal[2];
    });

    // Check step variance
    distances.sort((a, b) => a - b);
    const deltas: number[] = [];
    for (let i = 1; i < distances.length; i++) {
      const d = Math.abs(distances[i] - distances[i - 1]);
      if (d > 0.001) deltas.push(d);
    }

    if (deltas.length > 0) {
      const avg = deltas.reduce((acc, val) => acc + val, 0) / deltas.length;
      return {
        eligible: true,
        sliceCount: instances.length,
        regularSpacingMm: parseFloat(avg.toFixed(2)),
      };
    }
  }

  return {
    eligible: true,
    sliceCount: instances.length,
    regularSpacingMm: 3.0,
  };
}

/**
 * Build a 3D voxel volume from sorted 2D DICOM instances
 */
export function buildVoxelVolume(instances: ParsedDicomInstance[], sourcePlane: 'sagittal' | 'coronal' | 'axial'): Volume3D | null {
  if (!instances || instances.length === 0) return null;

  // Sort instances by instanceNumber or sliceLocation
  const sorted = [...instances].sort((a, b) => {
    if (a.metadata.instanceNumber !== b.metadata.instanceNumber) {
      return a.metadata.instanceNumber - b.metadata.instanceNumber;
    }
    return (a.metadata.sliceLocation || 0) - (b.metadata.sliceLocation || 0);
  });

  const cols = sorted[0].metadata.columns || 256;
  const rows = sorted[0].metadata.rows || 256;
  const depth = sorted.length;

  const totalVoxels = cols * rows * depth;
  const data = new Float32Array(totalVoxels);

  const pixelSpacing = sorted[0].metadata.pixelSpacing || [0.5, 0.5];
  const sliceSpacing = sorted[0].metadata.spacingBetweenSlices || sorted[0].metadata.sliceThickness || 3.0;

  for (let z = 0; z < depth; z++) {
    const inst = sorted[z];
    const rawPixels = inst.pixelData;
    const zOffset = z * rows * cols;

    if (rawPixels) {
      let minVal = Infinity;
      let maxVal = -Infinity;
      for (let i = 0; i < rawPixels.length; i++) {
        const val = rawPixels[i];
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
      const range = maxVal - minVal || 1;

      for (let i = 0; i < Math.min(rawPixels.length, rows * cols); i++) {
        data[zOffset + i] = (rawPixels[i] - minVal) / range;
      }
    } else {
      // Procedural synthetic knee tissue density fallback if raw pixels empty
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          data[zOffset + y * cols + x] = generateSyntheticVoxel(x / cols, y / rows, z / depth, sourcePlane);
        }
      }
    }
  }

  return {
    dimensions: [cols, rows, depth],
    spacing: [pixelSpacing[0], pixelSpacing[1], sliceSpacing],
    origin: [0, 0, 0],
    data,
    sourcePlane,
  };
}

/**
 * Generate synthetic anatomical MRI tissue intensity
 * Each (nx, ny, nz) coordinate maps to a point in a 3D knee volume.
 * Scrolling through slices changes nz, producing visually distinct cross-sections.
 */
export function generateSyntheticVoxel(
  nx: number,
  ny: number,
  nz: number,
  plane: 'sagittal' | 'coronal' | 'axial',
  variant: 'acute_tear' | 'normal_baseline' = 'acute_tear'
): number {
  // Knee joint coordinates centered around (0.5, 0.5, 0.5)
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const cz = nz - 0.5;

  let intensity = 0.03; // Background air (near-black)

  // Outer soft tissue envelope with smooth edge falloff
  const bodyRadiusX = 0.38 + 0.04 * Math.sin(nz * 6.28); // Slight medial-lateral girth variation
  const bodyRadiusY = 0.42;
  const bodyRadiusZ = 0.40;
  const distBody = Math.sqrt(
    (cx * cx) / (bodyRadiusX * bodyRadiusX) +
    (cy * cy) / (bodyRadiusY * bodyRadiusY) +
    (cz * cz) / (bodyRadiusZ * bodyRadiusZ)
  );

  if (distBody < 1.0) {
    // Smooth falloff at body boundary (simulates subcutaneous fat → skin → air transition)
    const edgeFade = distBody > 0.85 ? 1.0 - ((distBody - 0.85) / 0.15) : 1.0;

    // Subcutaneous fat and muscle with depth variation
    const fatMuscle = 0.22 + 0.06 * Math.sin(nx * 18 + nz * 12) + 0.03 * Math.cos(ny * 14 + nz * 8);
    intensity = fatMuscle * edgeFade;

    // Posterior subcutaneous fat (brighter on T2 FS)
    if (cx < -0.15 && distBody > 0.7 && distBody < 0.95) {
      intensity = Math.max(intensity, 0.35 * edgeFade);
    }

    // Quadriceps tendon (anterior, superior — dark band)
    const qtDist = Math.sqrt((cx + 0.28) * (cx + 0.28) * 4.0 + (cy + 0.2) * (cy + 0.2) * 3.0 + cz * cz * 2.0);
    if (qtDist < 0.08) {
      intensity = 0.07 * edgeFade; // Low signal tendon
    }

    // Popliteal fat pad (posterior, bright)
    const popDist = Math.sqrt((cx - 0.06) * (cx - 0.06) * 3.0 + (cy - 0.04) * (cy - 0.04) * 2.0 + cz * cz * 2.5);
    if (popDist < 0.1 && cx > -0.02) {
      intensity = 0.42 * edgeFade;
    }

    // Femoral condyles (Upper bone)
    const femDist = Math.sqrt(cx * cx * 1.5 + (cy + 0.16) * (cy + 0.16) * 2.2 + cz * cz * 1.4);
    if (femDist < 0.22) {
      const isCortical = femDist > 0.19;
      // Radiopaedia Finding: Bone contusion / edema in anterior lateral femoral condyle (Pivot-shift impaction)
      const isLateralAntFemoralContusion = variant === 'acute_tear' && cx > 0.04 && (cy + 0.16) > -0.06 && cz < -0.02;
      if (isCortical) {
        intensity = 0.05; // Low signal cortex
      } else if (isLateralAntFemoralContusion) {
        intensity = 0.82; // Hyperintense bone marrow oedema on T2 FS / PDFS
      } else {
        intensity = 0.60 + 0.05 * Math.sin(nx * 30 + ny * 25); // Marrow with trabecular texture
      }
    }

    // Femoral shaft (proximal extension)
    const fShaftDist = Math.sqrt(cx * cx * 2.0 + (cy + 0.32) * (cy + 0.32) * 1.0 + cz * cz * 2.0);
    if (fShaftDist < 0.11 && cy < -0.22) {
      const isCortical = fShaftDist > 0.085;
      intensity = isCortical ? 0.04 : 0.55;
    }

    // Tibial plateau (Lower bone)
    const tibDist = Math.sqrt(cx * cx * 1.4 + (cy - 0.2) * (cy - 0.2) * 2.5 + cz * cz * 1.4);
    if (tibDist < 0.23) {
      const isCortical = tibDist > 0.2;
      // Radiopaedia Finding: Bone contusion in posterior lateral tibial plateau
      const isPostLateralTibialContusion = variant === 'acute_tear' && cx < -0.04 && (cy - 0.2) > -0.06 && cz < -0.02;
      if (isCortical) {
        intensity = 0.05; // Low signal cortex
      } else if (isPostLateralTibialContusion) {
        intensity = 0.85; // Hyperintense bone marrow oedema
      } else {
        intensity = 0.58 + 0.04 * Math.sin(nx * 28 + ny * 22);
      }
    }

    // Tibial shaft (distal extension)
    const tShaftDist = Math.sqrt(cx * cx * 2.0 + (cy - 0.36) * (cy - 0.36) * 1.0 + cz * cz * 2.0);
    if (tShaftDist < 0.10 && cy > 0.28) {
      const isCortical = tShaftDist > 0.075;
      intensity = isCortical ? 0.04 : 0.52;
    }

    // Fibular head (lateral, inferior — only visible on lateral slices)
    const fibDist = Math.sqrt((cx - 0.02) * (cx - 0.02) * 3.0 + (cy - 0.26) * (cy - 0.26) * 3.0 + (cz + 0.18) * (cz + 0.18) * 3.0);
    if (fibDist < 0.06) {
      intensity = fibDist > 0.05 ? 0.05 : 0.50;
    }

    // Patella & Suprapatellar pouch effusion
    const patDist = Math.sqrt((cx + 0.22) * (cx + 0.22) * 3.0 + (cy + 0.05) * (cy + 0.05) * 3.0 + cz * cz * 2.5);
    if (patDist < 0.14) {
      intensity = patDist > 0.11 ? 0.05 : 0.72;
    }
    // Suprapatellar joint effusion pouch
    if (cx > 0.15 && cx < 0.26 && cy > -0.15 && cy < 0.0 && Math.abs(cz) < 0.2) {
      intensity = variant === 'acute_tear' ? 0.88 : 0.4; // Bright effusion vs minimal physiologic fluid
    }

    // Joint Space / Synovial fluid
    if (Math.abs(cy - 0.02) < 0.04 && Math.abs(cx) < 0.22 && Math.abs(cz) < 0.25) {
      intensity = variant === 'acute_tear' ? 0.85 : 0.5; // Joint fluid
    }

    // Intact PCL (Posterior Cruciate Ligament) - normal continuous low-signal arc
    const pclX = (cx + 0.08) + (cy - 0.02) * 0.8;
    const pclDist = Math.sqrt(pclX * pclX * 9.0 + (cy - 0.02) * (cy - 0.02) * 2.5 + (cz - 0.04) * (cz - 0.04) * 4.0);
    if (pclDist < 0.06) {
      intensity = 0.08; // Dark intact ligament band
    }

    // ACL Ligament path
    const aclX = cx - (cy - 0.02) * 1.2;
    const aclDist = Math.sqrt(aclX * aclX * 8.0 + (cy - 0.02) * (cy - 0.02) * 2.0 + cz * cz * 4.0);
    if (aclDist < 0.09) {
      if (variant === 'acute_tear') {
        // Discontinuous mid-substance fibers with fluid signal cleft
        const isMidSubstanceCleft = Math.abs(cy - 0.02) < 0.035;
        intensity = isMidSubstanceCleft ? 0.78 : 0.35 + 0.2 * Math.sin(nx * 35);
      } else {
        // Normal baseline: continuous dark taut band
        intensity = 0.09;
      }
    }

    // Menisci (Triangular low-signal fibrocartilage)
    // More visible on central slices, less on peripheral slices
    const meniscusVisibility = 1.0 - Math.min(1.0, Math.abs(cz) * 4.0);
    if (meniscusVisibility > 0.3) {
      // Medial meniscus
      if (Math.abs(cy - 0.04) < 0.025 && Math.abs(cx - 0.16) < 0.05) {
        intensity = 0.08;
      }
      // Lateral meniscus
      if (Math.abs(cy - 0.04) < 0.025 && Math.abs(cx + 0.16) < 0.05) {
        intensity = 0.08;
      }
    }

    // Patellar tendon (connects patella to tibial tuberosity — anterior low-signal band)
    if (cx < -0.16 && cx > -0.28 && cy > -0.02 && cy < 0.18 && Math.abs(cz) < 0.06) {
      intensity = 0.07;
    }

    // Apply the smooth body edge transition
    intensity *= edgeFade;
  }

  // Authentic MRI micro-texture noise (deterministic per-coordinate)
  const noise = (Math.sin(nx * 123.4 + ny * 321.5 + nz * 213.7) * 0.5 + 0.5) * 0.03;
  return Math.min(1.0, Math.max(0.0, intensity + noise));
}

/**
 * Extract 2D orthogonal slice from 3D voxel volume
 */
export function extractOrthogonalSlice(
  volume: Volume3D,
  targetPlane: 'sagittal' | 'coronal' | 'axial',
  sliceIndex: number,
  outputWidth: number,
  outputHeight: number
): Uint8ClampedArray {
  const [cols, rows, depth] = volume.dimensions;
  const pixels = new Uint8ClampedArray(outputWidth * outputHeight * 4);

  // Normalize sliceIndex into 0..1 coordinate
  let normIndex = 0.5;

  if (targetPlane === 'sagittal') {
    // Sagittal plane: X is constant, Y and Z vary
    normIndex = Math.min(1, Math.max(0, sliceIndex / (volume.sourcePlane === 'sagittal' ? depth : cols)));
    const srcX = Math.floor(normIndex * (cols - 1));

    for (let outY = 0; outY < outputHeight; outY++) {
      const srcY = Math.floor((outY / outputHeight) * (rows - 1));
      for (let outX = 0; outX < outputWidth; outX++) {
        let val = 0;
        if (volume.sourcePlane === 'sagittal') {
          const z = Math.min(depth - 1, Math.max(0, sliceIndex));
          val = volume.data[z * rows * cols + srcY * cols + Math.floor((outX / outputWidth) * (cols - 1))];
        } else {
          const srcZ = Math.floor((outX / outputWidth) * (depth - 1));
          val = volume.data[srcZ * rows * cols + srcY * cols + srcX];
        }
        const gray = Math.floor(val * 255);
        const outIdx = (outY * outputWidth + outX) * 4;
        pixels[outIdx] = gray;
        pixels[outIdx + 1] = gray;
        pixels[outIdx + 2] = gray;
        pixels[outIdx + 3] = 255;
      }
    }
  } else if (targetPlane === 'coronal') {
    // Coronal plane: Y is constant, X and Z vary
    normIndex = Math.min(1, Math.max(0, sliceIndex / (volume.sourcePlane === 'coronal' ? depth : rows)));
    const srcY = Math.floor(normIndex * (rows - 1));

    for (let outY = 0; outY < outputHeight; outY++) {
      const srcZ = Math.floor((outY / outputHeight) * (depth - 1));
      for (let outX = 0; outX < outputWidth; outX++) {
        const srcX = Math.floor((outX / outputWidth) * (cols - 1));
        let val = 0;
        if (volume.sourcePlane === 'coronal') {
          const z = Math.min(depth - 1, Math.max(0, sliceIndex));
          val = volume.data[z * rows * cols + Math.floor((outY / outputHeight) * (rows - 1)) * cols + srcX];
        } else {
          val = volume.data[srcZ * rows * cols + srcY * cols + srcX];
        }
        const gray = Math.floor(val * 255);
        const outIdx = (outY * outputWidth + outX) * 4;
        pixels[outIdx] = gray;
        pixels[outIdx + 1] = gray;
        pixels[outIdx + 2] = gray;
        pixels[outIdx + 3] = 255;
      }
    }
  } else {
    // Axial plane: Z is constant, X and Y vary
    normIndex = Math.min(1, Math.max(0, sliceIndex / (volume.sourcePlane === 'axial' ? depth : rows)));
    const srcZ = Math.floor(normIndex * (depth - 1));

    for (let outY = 0; outY < outputHeight; outY++) {
      const srcY = Math.floor((outY / outputHeight) * (rows - 1));
      for (let outX = 0; outX < outputWidth; outX++) {
        const srcX = Math.floor((outX / outputWidth) * (cols - 1));
        let val = 0;
        if (volume.sourcePlane === 'axial') {
          const z = Math.min(depth - 1, Math.max(0, sliceIndex));
          val = volume.data[z * rows * cols + srcY * cols + srcX];
        } else {
          val = volume.data[srcZ * rows * cols + srcY * cols + srcX];
        }
        const gray = Math.floor(val * 255);
        const outIdx = (outY * outputWidth + outX) * 4;
        pixels[outIdx] = gray;
        pixels[outIdx + 1] = gray;
        pixels[outIdx + 2] = gray;
        pixels[outIdx + 3] = 255;
      }
    }
  }

  return pixels;
}
