// Real-Life Patient Intake Scenarios for Testing & Demonstration

import { SyntheticFile, createSyntheticDicomFile } from '../dicom/synthetic-generator';
import { SYNTHETIC_FINAL_REPORT } from './synthetic-reports';

export type IntakeScenarioType = 'hospital_cd' | 'portal_zip' | 'mixed_folder';

export interface IntakeScenario {
  id: IntakeScenarioType;
  title: string;
  badge: string;
  description: string;
  sourceOrigin: string;
  files: SyntheticFile[];
}

/**
 * Generate files for Scenario A: Hospital CD-ROM Disc Layout
 */
export function generateHospitalCdScenario(): SyntheticFile[] {
  const studyUid = '1.2.826.0.1.3680043.8.498.15.20260815';
  const files: SyntheticFile[] = [];

  const series = [
    { num: 1, desc: 'Sagittal T2 FS (Fluid Sensitive)', plane: 'sagittal' as const, count: 34 },
    { num: 2, desc: 'Coronal PD (Proton Density)', plane: 'coronal' as const, count: 32 },
    { num: 3, desc: 'Axial T2 (Cross-section)', plane: 'axial' as const, count: 38 },
    { num: 4, desc: 'Sagittal T1 High-Resolution Anatomy', plane: 'sagittal' as const, count: 28 },
    { num: 5, desc: 'Localiser / 3-Plane Survey', plane: 'sagittal' as const, count: 3 },
  ];

  for (const s of series) {
    const sUid = `${studyUid}.${s.num}`;
    for (let i = 1; i <= s.count; i++) {
      const file = createSyntheticDicomFile(studyUid, sUid, s.num, i, s.desc, s.plane, s.count);
      file.name = `DICOM/ST00001/SE0000${s.num}/IM00${i.toString().padStart(3, '0')}.dcm`;
      files.push(file);
    }
  }

  // Hospital CD DICOMDIR
  const dicomdirBuf = new TextEncoder().encode('DICOMDIR Type 1 Directory Record Index for Hospital Knee MRI');
  files.push({
    name: 'DICOMDIR',
    buffer: dicomdirBuf.buffer,
    type: 'application/dicom',
    size: dicomdirBuf.byteLength,
  });

  // Windows Autorun file
  const autorunBuf = new TextEncoder().encode('[autorun]\nopen=VIEWER.EXE\nicon=VIEWER.EXE,0\nlabel=Hospital MRI CD');
  files.push({
    name: 'AUTORUN.INF',
    buffer: autorunBuf.buffer,
    type: 'text/plain',
    size: autorunBuf.byteLength,
  });

  // CD Viewer Executable (Bypassed securely)
  const exeBuf = new TextEncoder().encode('MZ... Windows CD DICOM Viewer Launcher placeholder (non-medical executable file)');
  files.push({
    name: 'VIEWER.EXE',
    buffer: exeBuf.buffer,
    type: 'application/x-msdownload',
    size: exeBuf.byteLength,
  });

  // Signed Report Text File
  const reportBuf = new TextEncoder().encode(SYNTHETIC_FINAL_REPORT.fullText);
  files.push({
    name: 'RADIOLOGY_REPORT.TXT',
    buffer: reportBuf.buffer,
    type: 'text/plain',
    size: reportBuf.byteLength,
  });

  return files;
}

/**
 * Generate files for Scenario B: Patient Portal ZIP Export (e.g. PocketHealth / MyChart)
 */
export function generatePortalZipScenario(): SyntheticFile[] {
  const studyUid = '1.2.826.0.1.3680043.8.498.15.20260815';
  const files: SyntheticFile[] = [];

  const series = [
    { num: 1, desc: 'Sagittal T2 FS (Fluid Sensitive)', plane: 'sagittal' as const, count: 34 },
    { num: 2, desc: 'Coronal PD (Proton Density)', plane: 'coronal' as const, count: 32 },
    { num: 3, desc: 'Axial T2 (Cross-section)', plane: 'axial' as const, count: 38 },
  ];

  for (const s of series) {
    const sUid = `${studyUid}.${s.num}`;
    for (let i = 1; i <= s.count; i++) {
      const file = createSyntheticDicomFile(studyUid, sUid, s.num, i, s.desc, s.plane, s.count);
      // Portal files often have raw SOP UIDs without .dcm extension
      file.name = `Study_20260815/${sUid}.${i}`;
      files.push(file);
    }
  }

  // Portal Signed Report
  const reportBuf = new TextEncoder().encode(SYNTHETIC_FINAL_REPORT.fullText);
  files.push({
    name: 'Study_20260815/Signed_Radiology_Report_Left_Knee.txt',
    buffer: reportBuf.buffer,
    type: 'text/plain',
    size: reportBuf.byteLength,
  });

  return files;
}

/**
 * Generate files for Scenario C: Direct Mixed Folder Drop
 */
export function generateMixedFolderScenario(): SyntheticFile[] {
  const studyUid = '1.2.826.0.1.3680043.8.498.15.20260815';
  const files: SyntheticFile[] = [];

  const series = [
    { num: 1, desc: 'Sagittal T2 FS (Fluid Sensitive)', plane: 'sagittal' as const, count: 34 },
    { num: 2, desc: 'Coronal PD (Proton Density)', plane: 'coronal' as const, count: 32 },
    { num: 4, desc: 'Sagittal T1 High-Resolution Anatomy', plane: 'sagittal' as const, count: 28 },
  ];

  for (const s of series) {
    const sUid = `${studyUid}.${s.num}`;
    for (let i = 1; i <= s.count; i++) {
      const file = createSyntheticDicomFile(studyUid, sUid, s.num, i, s.desc, s.plane, s.count);
      file.name = `IMG_${s.num}_${i}.IMA`; // Siemens .IMA extension
      files.push(file);
    }
  }

  // Corrupt slice
  const corruptBuf = new ArrayBuffer(256);
  new Uint8Array(corruptBuf).fill(0x55);
  files.push({
    name: 'IMG_CORRUPT_SLICE_09.dcm',
    buffer: corruptBuf,
    type: 'application/dicom',
    size: 256,
  });

  // Duplicate slice
  const dup = createSyntheticDicomFile(studyUid, `${studyUid}.1`, 1, 10, 'Sagittal T2 FS', 'sagittal', 34);
  dup.name = 'IMG_1_10_copy.dcm';
  files.push(dup);

  // Signed Report
  const reportBuf = new TextEncoder().encode(SYNTHETIC_FINAL_REPORT.fullText);
  files.push({
    name: 'Knee_MRI_Report.txt',
    buffer: reportBuf.buffer,
    type: 'text/plain',
    size: reportBuf.byteLength,
  });

  return files;
}

export const REAL_LIFE_SCENARIOS: Record<IntakeScenarioType, IntakeScenario> = {
  hospital_cd: {
    id: 'hospital_cd',
    title: 'Hospital Disc (CD/DVD Layout)',
    badge: 'Hospital CD / DVD',
    description: 'Simulates hospital optical disc containing DICOMDIR, nested DICOM folders, AUTORUN.INF, CD viewer launcher, and signed report.',
    sourceOrigin: 'NHS / General Hospital Radiology CD',
    files: [],
  },
  portal_zip: {
    id: 'portal_zip',
    title: 'Patient Portal ZIP (PocketHealth / MyChart)',
    badge: 'Portal ZIP Export',
    description: 'Simulates direct portal export with extensionless UID files, multi-series stacks, and embedded report text.',
    sourceOrigin: 'PocketHealth / Epic MyChart Portal',
    files: [],
  },
  mixed_folder: {
    id: 'mixed_folder',
    title: 'Mixed Desktop Folder (.IMA, Duplicates & Faults)',
    badge: 'Mixed Files & Faults',
    description: 'Simulates loose Siemens .IMA slices, duplicate files, corrupt header slice, and report text to verify fault tolerance.',
    sourceOrigin: 'Local USB Drive / Imaging Centre Folder',
    files: [],
  },
};
