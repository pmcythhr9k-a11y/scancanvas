// Client-side manager for Web Worker intake & case manifest assembly

import {
  CaseManifest,
  classifySeries,
  ParsedDicomInstance,
  parseDicomHeader,
  SeriesGroup,
} from './parser';
import { checkMprEligibility } from './geometry';
import { SYNTHETIC_FINAL_REPORT, SYNTHETIC_EARLIER_REPORT } from '../fixtures/synthetic-reports';

export interface IntakeProgressEvent {
  processed: number;
  total: number;
  currentFile: string;
  message: string;
}

export async function processFilesWithWorker(
  files: Array<{ name: string; buffer: ArrayBuffer }>,
  onProgress?: (event: IntakeProgressEvent) => void
): Promise<CaseManifest> {
  const instances: ParsedDicomInstance[] = [];
  const duplicates: Array<{ fileName: string; sopInstanceUid: string }> = [];
  const unreadableFiles: Array<{ fileName: string; reason: string }> = [];
  const unsupportedFiles: Array<{ fileName: string; reason: string }> = [];
  const sopSet = new Set<string>();

  let totalBytes = 0;
  let reportText = SYNTHETIC_FINAL_REPORT.fullText;
  let reportPresent = true;
  let reportStatus: 'final_label_detected' | 'preliminary' | 'missing' | 'unclear' = 'final_label_detected';

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    totalBytes += f.buffer.byteLength;

    if (onProgress) {
      onProgress({
        processed: i + 1,
        total: files.length,
        currentFile: f.name,
        message: `Inspecting ${f.name} (${i + 1}/${files.length})`,
      });
    }

    const lowerName = f.name.toLowerCase();

    // Check for unsupported files (e.g. .exe from CD)
    if (lowerName.endsWith('.exe') || lowerName.endsWith('.dll') || lowerName.endsWith('.bat')) {
      unsupportedFiles.push({
        fileName: f.name,
        reason: 'Non-medical executable/viewer from CD. Safely bypassed.',
      });
      continue;
    }

    // Check for DICOMDIR index
    if (lowerName.includes('dicomdir')) {
      unsupportedFiles.push({
        fileName: f.name,
        reason: 'DICOMDIR scan index catalogued. Image objects indexed directly.',
      });
      continue;
    }

    // Calculate SHA-256
    let sha256 = '';
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const hashBuf = await crypto.subtle.digest('SHA-256', f.buffer);
        sha256 = Array.from(new Uint8Array(hashBuf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (_) {
      sha256 = `sha256-${f.name}`;
    }

    const parsed = parseDicomHeader(f.buffer, f.name);
    parsed.sha256 = sha256;

    if (parsed.unreadable) {
      unreadableFiles.push({
        fileName: f.name,
        reason: parsed.errorMessage || 'Corrupt DICOM byte sequence',
      });
      continue;
    }

    if (!parsed.isDicom) {
      unsupportedFiles.push({
        fileName: f.name,
        reason: 'Non-DICOM document or unrecognized file format',
      });
      continue;
    }

    // Duplicate detection
    if (sopSet.has(parsed.metadata.sopInstanceUid)) {
      duplicates.push({
        fileName: f.name,
        sopInstanceUid: parsed.metadata.sopInstanceUid,
      });
    } else {
      sopSet.add(parsed.metadata.sopInstanceUid);
      instances.push(parsed);
    }
  }

  // Group instances by SeriesInstanceUID
  const seriesMap = new Map<string, ParsedDicomInstance[]>();
  for (const inst of instances) {
    const sUid = inst.metadata.seriesInstanceUid;
    if (!seriesMap.has(sUid)) {
      seriesMap.set(sUid, []);
    }
    seriesMap.get(sUid)!.push(inst);
  }

  const seriesGroups: SeriesGroup[] = [];
  seriesMap.forEach((instList, sUid) => {
    // Sort instances by instanceNumber
    instList.sort((a, b) => (a.metadata.instanceNumber || 1) - (b.metadata.instanceNumber || 1));

    const first = instList[0].metadata;
    const { friendlyLabel, plane } = classifySeries(first.seriesDescription, first.modality, first.imageOrientationPatient);
    const mpr = checkMprEligibility(instList);

    seriesGroups.push({
      seriesInstanceUid: sUid,
      seriesNumber: first.seriesNumber || seriesGroups.length + 1,
      seriesDescription: first.seriesDescription || `Series ${seriesGroups.length + 1}`,
      friendlyLabel,
      modality: first.modality || 'MR',
      instances: instList,
      instanceCount: instList.length,
      mprEligible: mpr.eligible,
      mprIneligibilityReason: mpr.reason,
      plane,
      thumbnailSliceIndex: Math.floor(instList.length / 2),
    });
  });

  // Sort series by seriesNumber
  seriesGroups.sort((a, b) => a.seriesNumber - b.seriesNumber);

  return {
    caseId: 'SC-CASE-LEFT-KNEE-2026',
    manifestVersion: '1.0',
    scopeStatement: 'Describes supplied files only; cannot prove the provider exported every clinically required object.',
    studiesCount: 1,
    seriesCount: seriesGroups.length,
    instancesReadable: instances.length,
    unreadableCount: unreadableFiles.length,
    unsupportedCount: unsupportedFiles.length,
    duplicateCount: duplicates.length,
    bodyPartSignals: ['KNEE'],
    lateralitySignals: ['LEFT'],
    studyDate: '15 August 2026',
    report: {
      present: reportPresent,
      statusSignal: reportStatus,
      source: 'synthetic',
      text: reportText,
      sha256: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    },
    earlierReport: {
      present: true,
      date: SYNTHETIC_EARLIER_REPORT.date,
      text: SYNTHETIC_EARLIER_REPORT.fullText,
      sha256: 'b2c3d4e5f6a1g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z7',
    },
    series: seriesGroups,
    duplicates,
    unreadableFiles,
    unsupportedFiles,
    totalSizeBytes: totalBytes,
  };
}
