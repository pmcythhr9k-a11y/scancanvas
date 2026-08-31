import { ParsedDicomInstance } from './parser';

export function getDemoKneeDataset(variant: 'acute_tear' | 'normal_baseline' = 'acute_tear'): ParsedDicomInstance[] {
  const instances: ParsedDicomInstance[] = [];

  if (variant === 'acute_tear') {
    // rID 87396 Multi-Planar Knee Study
    const studyUid = '1.2.826.0.1.3680043.8.498.15.20260815';

    // 1. Sagittal PD-FS (Side View · ACL Tear & Bone Marrow Contusion - 25 slices)
    const series1Uid = `${studyUid}.1`;
    for (let i = 1; i <= 25; i++) {
      instances.push({
        fileId: `demo-acute-sag-pd-${i}`,
        fileName: `sag_pd_${i}.jpg`,
        fileSize: 100000,
        sha256: '',
        isDicom: false,
        imageUrl: `/demo/knee/acute/slice_${i}.jpg`,
        metadata: {
          sopInstanceUid: `${series1Uid}.${i}`,
          seriesInstanceUid: series1Uid,
          studyInstanceUid: studyUid,
          modality: 'MR',
          seriesNumber: 1,
          seriesDescription: 'Sagittal PD-FS (ACL Tear & Bone Contusion)',
          instanceNumber: i,
          rows: 1017,
          columns: 921,
          bitsAllocated: 8,
          bitsStored: 8,
          highBit: 7,
          pixelRepresentation: 0,
          transferSyntaxUid: '1.2.840.10008.1.2.4.50',
          patientName: 'DEMO^LEFT KNEE',
          patientId: 'SC-2026-08',
          bodyPartExamined: 'KNEE',
          laterality: 'L',
          studyDate: '20260815',
        },
        pixelDataOffset: 0,
        pixelDataLength: 0,
      });
    }

    // 2. Coronal PD-FS (Front View · Meniscus & Collateral Ligaments - 25 slices)
    const series2Uid = `${studyUid}.2`;
    for (let i = 1; i <= 25; i++) {
      instances.push({
        fileId: `demo-acute-cor-pd-${i}`,
        fileName: `cor_pd_${i}.jpg`,
        fileSize: 90000,
        sha256: '',
        isDicom: false,
        imageUrl: `/demo/knee/coronal_pd/slice_${i}.jpg`,
        metadata: {
          sopInstanceUid: `${series2Uid}.${i}`,
          seriesInstanceUid: series2Uid,
          studyInstanceUid: studyUid,
          modality: 'MR',
          seriesNumber: 2,
          seriesDescription: 'Coronal PD-FS (Meniscus & Collaterals)',
          instanceNumber: i,
          rows: 916,
          columns: 916,
          bitsAllocated: 8,
          bitsStored: 8,
          highBit: 7,
          pixelRepresentation: 0,
          transferSyntaxUid: '1.2.840.10008.1.2.4.50',
          patientName: 'DEMO^LEFT KNEE',
          patientId: 'SC-2026-08',
          bodyPartExamined: 'KNEE',
          laterality: 'L',
          studyDate: '20260815',
        },
        pixelDataOffset: 0,
        pixelDataLength: 0,
      });
    }

    // 3. Coronal T1 (Front View · High-Resolution Anatomy - 25 slices)
    const series3Uid = `${studyUid}.3`;
    for (let i = 1; i <= 25; i++) {
      instances.push({
        fileId: `demo-acute-cor-t1-${i}`,
        fileName: `cor_t1_${i}.jpg`,
        fileSize: 110000,
        sha256: '',
        isDicom: false,
        imageUrl: `/demo/knee/coronal_t1/slice_${i}.jpg`,
        metadata: {
          sopInstanceUid: `${series3Uid}.${i}`,
          seriesInstanceUid: series3Uid,
          studyInstanceUid: studyUid,
          modality: 'MR',
          seriesNumber: 3,
          seriesDescription: 'Coronal T1 (High-Resolution Anatomy)',
          instanceNumber: i,
          rows: 916,
          columns: 916,
          bitsAllocated: 8,
          bitsStored: 8,
          highBit: 7,
          pixelRepresentation: 0,
          transferSyntaxUid: '1.2.840.10008.1.2.4.50',
          patientName: 'DEMO^LEFT KNEE',
          patientId: 'SC-2026-08',
          bodyPartExamined: 'KNEE',
          laterality: 'L',
          studyDate: '20260815',
        },
        pixelDataOffset: 0,
        pixelDataLength: 0,
      });
    }

    // 4. Axial PD-FS (Cross-Section · Patella & Popliteus - 25 slices)
    const series4Uid = `${studyUid}.4`;
    for (let i = 1; i <= 25; i++) {
      instances.push({
        fileId: `demo-acute-ax-pd-${i}`,
        fileName: `ax_pd_${i}.jpg`,
        fileSize: 100000,
        sha256: '',
        isDicom: false,
        imageUrl: `/demo/knee/axial_pd/slice_${i}.jpg`,
        metadata: {
          sopInstanceUid: `${series4Uid}.${i}`,
          seriesInstanceUid: series4Uid,
          studyInstanceUid: studyUid,
          modality: 'MR',
          seriesNumber: 4,
          seriesDescription: 'Axial PD-FS (Patella & Retinaculum)',
          instanceNumber: i,
          rows: 922,
          columns: 907,
          bitsAllocated: 8,
          bitsStored: 8,
          highBit: 7,
          pixelRepresentation: 0,
          transferSyntaxUid: '1.2.840.10008.1.2.4.50',
          patientName: 'DEMO^LEFT KNEE',
          patientId: 'SC-2026-08',
          bodyPartExamined: 'KNEE',
          laterality: 'L',
          studyDate: '20260815',
        },
        pixelDataOffset: 0,
        pixelDataLength: 0,
      });
    }
  } else {
    // rID 147131 (Normal, 31 slices)
    const studyUid = '1.2.826.0.1.3680043.8.498.15.20250303';
    const seriesUid = `${studyUid}.1`;
    
    for (let i = 1; i <= 31; i++) {
      const url = `/demo/knee/normal/slice_${i}.jpg`;
      
      instances.push({
        fileId: `demo-normal-${i}`,
        fileName: `slice_${i}.jpg`,
        fileSize: 30000,
        sha256: '',
        isDicom: false,
        imageUrl: url,
        metadata: {
          sopInstanceUid: `${seriesUid}.${i}`,
          seriesInstanceUid: seriesUid,
          studyInstanceUid: studyUid,
          modality: 'MR',
          seriesDescription: 'Sagittal PD-FS (Normal Knee)',
          instanceNumber: i,
          rows: 512,
          columns: 512,
          bitsAllocated: 8,
          bitsStored: 8,
          highBit: 7,
          pixelRepresentation: 0,
          transferSyntaxUid: '1.2.840.10008.1.2.4.50',
          patientName: 'DEMO^LEFT KNEE',
          patientId: 'SC-2026-08',
          bodyPartExamined: 'KNEE',
          laterality: 'L',
          studyDate: '20250303'
        },
        pixelDataOffset: 0,
        pixelDataLength: 0,
      });
    }
  }

  return instances;
}

import { CaseManifest, SeriesGroup, classifySeries } from './parser';
import { checkMprEligibility } from './geometry';
import { SYNTHETIC_FINAL_REPORT, SYNTHETIC_EARLIER_REPORT } from '../fixtures/synthetic-reports';

export function buildDemoCaseManifest(variant: 'acute_tear' | 'normal_baseline' = 'acute_tear'): CaseManifest {
  const instances = getDemoKneeDataset(variant);
  
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
    instList.sort((a, b) => (a.metadata.instanceNumber || 1) - (b.metadata.instanceNumber || 1));

    const first = instList[0].metadata;
    const { friendlyLabel, plane } = classifySeries(first.seriesDescription, first.modality, first.imageOrientationPatient);
    const mpr = checkMprEligibility(instList);

    seriesGroups.push({
      seriesInstanceUid: sUid,
      seriesNumber: first.seriesNumber || 1,
      seriesDescription: first.seriesDescription || `Series 1`,
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

  return {
    caseId: variant === 'acute_tear' ? 'SC-DEMO-ACL-TEAR' : 'SC-DEMO-NORMAL-KNEE',
    manifestVersion: '1.0',
    scopeStatement: 'Demonstration synthetic dataset based on CC BY-NC-SA 3.0 JPEGs from NC Commons.',
    studiesCount: 1,
    seriesCount: seriesGroups.length,
    instancesReadable: instances.length,
    unreadableCount: 0,
    unsupportedCount: 0,
    duplicateCount: 0,
    bodyPartSignals: ['KNEE'],
    lateralitySignals: ['LEFT'],
    studyDate: variant === 'acute_tear' ? '15 August 2026' : '03 March 2025',
    report: {
      present: true,
      statusSignal: 'final_label_detected',
      source: 'synthetic',
      text: SYNTHETIC_FINAL_REPORT.fullText,
      sha256: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    },
    earlierReport: {
      present: true,
      date: SYNTHETIC_EARLIER_REPORT.date,
      text: SYNTHETIC_EARLIER_REPORT.fullText,
      sha256: 'b2c3d4e5f6a1g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z7',
    },
    series: seriesGroups,
    duplicates: [],
    unreadableFiles: [],
    unsupportedFiles: [],
    totalSizeBytes: 0,
  };
}

export interface SyntheticFile {
  name: string;
  buffer: ArrayBuffer;
  type: string;
  size: number;
}

export function createSyntheticDicomFile(
  studyUid: string,
  seriesUid: string,
  seriesNum: number,
  instanceNum: number,
  desc: string,
  plane: string,
  totalSlices: number
): SyntheticFile {
  const rows = 256;
  const cols = 256;
  const pixelCount = rows * cols;
  const pixelDataBytes = pixelCount * 2;
  
  const totalSize = 128 + 4 + 2048 + pixelDataBytes;
  const buffer = new ArrayBuffer(totalSize);
  const dataView = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);

  // 128 bytes preamble (0x00)
  // 'DICM' at 128
  uint8[128] = 0x44; // D
  uint8[129] = 0x49; // I
  uint8[130] = 0x43; // C
  uint8[131] = 0x4D; // M

  let offset = 132;

  function writeStringTag(group: number, element: number, vr: string, value: string) {
    let str = value;
    if (str.length % 2 !== 0) str += ' ';
    dataView.setUint16(offset, group, true);
    dataView.setUint16(offset + 2, element, true);
    uint8[offset + 4] = vr.charCodeAt(0);
    uint8[offset + 5] = vr.charCodeAt(1);
    
    if (['OB', 'OW', 'OF', 'SQ', 'UT', 'UN'].includes(vr)) {
      dataView.setUint16(offset + 6, 0, true);
      dataView.setUint32(offset + 8, str.length, true);
      offset += 12;
    } else {
      dataView.setUint16(offset + 6, str.length, true);
      offset += 8;
    }
    for (let i = 0; i < str.length; i++) {
      uint8[offset + i] = str.charCodeAt(i);
    }
    offset += str.length;
  }

  function writeUint16Tag(group: number, element: number, vr: string, val: number) {
    dataView.setUint16(offset, group, true);
    dataView.setUint16(offset + 2, element, true);
    uint8[offset + 4] = vr.charCodeAt(0);
    uint8[offset + 5] = vr.charCodeAt(1);
    dataView.setUint16(offset + 6, 2, true);
    dataView.setUint16(offset + 8, val, true);
    offset += 10;
  }

  writeStringTag(0x0002, 0x0010, 'UI', '1.2.840.10008.1.2.1');
  writeStringTag(0x0008, 0x0060, 'CS', 'MR');
  writeStringTag(0x0008, 0x0018, 'UI', `${seriesUid}.${instanceNum}`);
  writeStringTag(0x0020, 0x000D, 'UI', studyUid);
  writeStringTag(0x0020, 0x000E, 'UI', seriesUid);
  writeStringTag(0x0008, 0x103E, 'LO', desc);
  writeStringTag(0x0010, 0x0010, 'PN', 'DEMO^LEFT KNEE');
  writeStringTag(0x0010, 0x0020, 'LO', 'SC-2026-08');
  writeStringTag(0x0020, 0x0060, 'CS', 'L');
  writeStringTag(0x0018, 0x0015, 'CS', 'KNEE');
  writeStringTag(0x0020, 0x0011, 'IS', seriesNum.toString());
  writeStringTag(0x0020, 0x0013, 'IS', instanceNum.toString());

  writeUint16Tag(0x0028, 0x0010, 'US', rows);
  writeUint16Tag(0x0028, 0x0011, 'US', cols);
  writeUint16Tag(0x0028, 0x0100, 'US', 16);
  writeUint16Tag(0x0028, 0x0101, 'US', 12);
  writeUint16Tag(0x0028, 0x0102, 'US', 11);
  writeUint16Tag(0x0028, 0x0103, 'US', 0);

  let iop = '1\\0\\0\\0\\1\\0';
  if (plane === 'sagittal') iop = '0\\1\\0\\0\\0\\-1';
  else if (plane === 'coronal') iop = '1\\0\\0\\0\\0\\-1';
  else if (plane === 'axial') iop = '1\\0\\0\\0\\1\\0';
  writeStringTag(0x0020, 0x0037, 'DS', iop);

  const sliceSpacing = 3.0;
  const zPos = (instanceNum - totalSlices / 2) * sliceSpacing;
  let ipp = `0\\0\\${zPos.toFixed(2)}`;
  if (plane === 'sagittal') ipp = `${zPos.toFixed(2)}\\0\\0`;
  else if (plane === 'coronal') ipp = `0\\${zPos.toFixed(2)}\\0`;
  writeStringTag(0x0020, 0x0032, 'DS', ipp);

  // Pixel Data (0x7FE0, 0x0010)
  dataView.setUint16(offset, 0x7FE0, true);
  dataView.setUint16(offset + 2, 0x0010, true);
  uint8[offset + 4] = 'O'.charCodeAt(0);
  uint8[offset + 5] = 'W'.charCodeAt(0);
  dataView.setUint16(offset + 6, 0, true);
  dataView.setUint32(offset + 8, pixelDataBytes, true);
  offset += 12;

  const centerX = cols / 2;
  const centerY = rows / 2;
  const zNorm = (instanceNum - totalSlices / 2) / (totalSlices / 2);
  const condyleR = Math.max(20, 65 * (1 - zNorm * zNorm * 0.5));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let val = 20;
      if (dist < 100) val = 120;
      
      const dyFemur = y - (centerY - 35);
      if (dx * dx + dyFemur * dyFemur < condyleR * condyleR * 0.7) {
        val = 650;
        if (dx * dx + dyFemur * dyFemur < (condyleR - 8) * (condyleR - 8) * 0.7) {
          val = 1450;
          if (instanceNum >= 14 && instanceNum <= 22 && dx > 8) {
            val = 2800;
          }
        }
      }

      const dyTibia = y - (centerY + 45);
      if (dx * dx * 0.8 + dyTibia * dyTibia < condyleR * condyleR * 0.65) {
        val = 620;
        if (dx * dx * 0.8 + dyTibia * dyTibia < (condyleR - 8) * (condyleR - 8) * 0.65) {
          val = 1400;
        }
      }

      if (plane === 'sagittal' && Math.abs(dx + dy * 0.5) < 7 && y > centerY - 25 && y < centerY + 25) {
        if (instanceNum >= 16 && instanceNum <= 20) {
          val = 2600;
        } else {
          val = 280;
        }
      }

      dataView.setUint16(offset, Math.min(4095, val), true);
      offset += 2;
    }
  }

  const finalBuf = buffer.slice(0, offset);
  return {
    name: `slice_${instanceNum}.dcm`,
    buffer: finalBuf,
    type: 'application/dicom',
    size: finalBuf.byteLength,
  };
}
