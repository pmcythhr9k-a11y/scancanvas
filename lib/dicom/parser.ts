// DICOM Part 10 Parser and Metadata Extractor

export interface DicomMetadata {
  sopInstanceUid: string;
  seriesInstanceUid: string;
  studyInstanceUid: string;
  patientId?: string;
  patientName?: string;
  modality: string;
  seriesDescription: string;
  instanceNumber: number;
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  highBit: number;
  pixelRepresentation: number;
  windowCenter?: number;
  windowWidth?: number;
  rescaleIntercept?: number;
  rescaleSlope?: number;
  pixelSpacing?: [number, number];
  imagePositionPatient?: [number, number, number];
  imageOrientationPatient?: [number, number, number, number, number, number];
  sliceThickness?: number;
  sliceLocation?: number;
  spacingBetweenSlices?: number;
  repetitionTime?: number;
  echoTime?: number;
  laterality?: string;
  bodyPartExamined?: string;
  transferSyntaxUid: string;
  studyDate?: string;
  seriesNumber?: number;
}

export interface ParsedDicomInstance {
  fileId: string;
  fileName: string;
  fileSize: number;
  sha256: string;
  metadata: DicomMetadata;
  pixelDataOffset: number;
  pixelDataLength: number;
  pixelData?: Uint8Array | Uint16Array | Int16Array;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  isDicom: boolean;
  unreadable?: boolean;
  errorMessage?: string;
}

export interface SeriesGroup {
  seriesInstanceUid: string;
  seriesNumber: number;
  seriesDescription: string;
  friendlyLabel: string;
  modality: string;
  instances: ParsedDicomInstance[];
  instanceCount: number;
  mprEligible: boolean;
  mprIneligibilityReason?: string;
  plane: 'sagittal' | 'coronal' | 'axial' | 'oblique' | 'localizer';
  thumbnailSliceIndex: number;
}

export interface CaseManifest {
  caseId: string;
  manifestVersion: string;
  scopeStatement: string;
  studiesCount: number;
  seriesCount: number;
  instancesReadable: number;
  unreadableCount: number;
  unsupportedCount: number;
  duplicateCount: number;
  bodyPartSignals: string[];
  lateralitySignals: string[];
  studyDate?: string;
  report: {
    present: boolean;
    statusSignal: 'final_label_detected' | 'preliminary' | 'missing' | 'unclear';
    source: 'pasted_text' | 'pdf' | 'synthetic' | 'none';
    text?: string;
    sha256?: string;
  };
  earlierReport?: {
    present: boolean;
    date?: string;
    text?: string;
    sha256?: string;
  };
  series: SeriesGroup[];
  duplicates: Array<{ fileName: string; sopInstanceUid: string }>;
  unreadableFiles: Array<{ fileName: string; reason: string }>;
  unsupportedFiles: Array<{ fileName: string; reason: string }>;
  totalSizeBytes: number;
}

/**
 * Determine patient-friendly series label and primary orientation plane
 */
export function classifySeries(desc: string, modality: string, orientation?: number[]): {
  friendlyLabel: string;
  plane: 'sagittal' | 'coronal' | 'axial' | 'oblique' | 'localizer';
} {
  const d = (desc || '').toLowerCase();

  // Localizer
  if (d.includes('loc') || d.includes('scout') || d.includes('survey')) {
    return { friendlyLabel: 'Localiser / Planning', plane: 'localizer' };
  }

  // Derive plane from ImageOrientationPatient if available
  let plane: 'sagittal' | 'coronal' | 'axial' | 'oblique' = 'oblique';
  if (orientation && orientation.length === 6) {
    const [x1, y1, z1, x2, y2, z2] = orientation;
    const crossX = y1 * z2 - z1 * y2;
    const crossY = z1 * x2 - x1 * z2;
    const crossZ = x1 * y2 - y1 * x2;
    const absX = Math.abs(crossX);
    const absY = Math.abs(crossY);
    const absZ = Math.abs(crossZ);

    if (absX > absY && absX > absZ) {
      plane = 'sagittal';
    } else if (absY > absX && absY > absZ) {
      plane = 'coronal';
    } else if (absZ > absX && absZ > absY) {
      plane = 'axial';
    }
  }

  // Fallback to description string
  if (plane === 'oblique') {
    if (d.includes('sag') || d.includes('side')) plane = 'sagittal';
    else if (d.includes('cor') || d.includes('front')) plane = 'coronal';
    else if (d.includes('ax') || d.includes('tra') || d.includes('cross')) plane = 'axial';
  }

  // Contrast / Sequence details
  let weighting = 'anatomy';
  if (d.includes('t2') || d.includes('fs') || d.includes('pdf') || d.includes('fluid') || d.includes('stir') || d.includes('dess')) {
    weighting = 'fluid-sensitive';
  } else if (d.includes('pd') || d.includes('density') || d.includes('cartilage')) {
    weighting = 'cartilage / tissue';
  } else if (d.includes('t1')) {
    weighting = 'high-resolution anatomy';
  }

  const planeName = plane === 'sagittal' ? 'Side view' : plane === 'coronal' ? 'Front view' : plane === 'axial' ? 'Cross-section' : 'View';
  return {
    friendlyLabel: `${planeName} · ${weighting}`,
    plane,
  };
}

/**
 * Fast in-browser DICOM parser
 */
export function parseDicomHeader(buffer: ArrayBuffer, fileName: string): ParsedDicomInstance {
  const dataView = new DataView(buffer);
  const fileSize = buffer.byteLength;

  if (fileSize < 132) {
    return {
      fileId: fileName,
      fileName,
      fileSize,
      sha256: '',
      isDicom: false,
      unreadable: true,
      errorMessage: 'File too small to be DICOM',
      metadata: createEmptyMetadata(),
      pixelDataOffset: 0,
      pixelDataLength: 0,
    };
  }

  // Check for 'DICM' at offset 128
  const isPart10 =
    dataView.getUint8(128) === 0x44 && // 'D'
    dataView.getUint8(129) === 0x49 && // 'I'
    dataView.getUint8(130) === 0x43 && // 'C'
    dataView.getUint8(131) === 0x4d;   // 'M'

  let offset = isPart10 ? 132 : 0;
  const metadata = createEmptyMetadata();
  let pixelDataOffset = 0;
  let pixelDataLength = 0;

  try {
    let isLittleEndian = true;
    let isExplicitVR = true;

    // Scan tags
    while (offset < fileSize - 8) {
      const group = dataView.getUint16(offset, isLittleEndian);
      const element = dataView.getUint16(offset + 2, isLittleEndian);
      offset += 4;

      let vr = '';
      let length = 0;

      if (isExplicitVR && group !== 0xfffe) {
        // Read 2-byte VR string
        const c1 = String.fromCharCode(dataView.getUint8(offset));
        const c2 = String.fromCharCode(dataView.getUint8(offset + 1));
        vr = c1 + c2;
        offset += 2;

        if (['OB', 'OW', 'OF', 'SQ', 'UT', 'UN'].includes(vr)) {
          offset += 2; // 2 reserved bytes
          length = dataView.getUint32(offset, isLittleEndian);
          offset += 4;
        } else {
          length = dataView.getUint16(offset, isLittleEndian);
          offset += 2;
        }
      } else {
        length = dataView.getUint32(offset, isLittleEndian);
        offset += 4;
      }

      if (length === 0xffffffff) {
        // Undefined length sequence
        break;
      }

      if (offset + length > fileSize) {
        break;
      }

      // Extract specific tags
      if (group === 0x0002 && element === 0x0010) {
        // Transfer Syntax UID
        metadata.transferSyntaxUid = readString(dataView, offset, length);
        if (metadata.transferSyntaxUid === '1.2.840.10008.1.2') {
          isExplicitVR = false;
        }
      } else if (group === 0x0008 && element === 0x0018) {
        // SOP Instance UID
        metadata.sopInstanceUid = readString(dataView, offset, length);
      } else if (group === 0x0008 && element === 0x0060) {
        // Modality
        metadata.modality = readString(dataView, offset, length);
      } else if (group === 0x0008 && element === 0x103e) {
        // Series Description
        metadata.seriesDescription = readString(dataView, offset, length);
      } else if (group === 0x0008 && element === 0x0020) {
        // Study Date
        metadata.studyDate = readString(dataView, offset, length);
      } else if (group === 0x0010 && element === 0x0010) {
        // Patient Name
        metadata.patientName = readString(dataView, offset, length);
      } else if (group === 0x0010 && element === 0x0020) {
        // Patient ID
        metadata.patientId = readString(dataView, offset, length);
      } else if (group === 0x0018 && element === 0x0015) {
        // Body Part Examined
        metadata.bodyPartExamined = readString(dataView, offset, length);
      } else if (group === 0x0018 && element === 0x0080) {
        // Repetition Time
        metadata.repetitionTime = parseFloat(readString(dataView, offset, length)) || undefined;
      } else if (group === 0x0018 && element === 0x0081) {
        // Echo Time
        metadata.echoTime = parseFloat(readString(dataView, offset, length)) || undefined;
      } else if (group === 0x0020 && element === 0x000d) {
        // Study Instance UID
        metadata.studyInstanceUid = readString(dataView, offset, length);
      } else if (group === 0x0020 && element === 0x000e) {
        // Series Instance UID
        metadata.seriesInstanceUid = readString(dataView, offset, length);
      } else if (group === 0x0020 && element === 0x0011) {
        // Series Number
        metadata.seriesNumber = parseInt(readString(dataView, offset, length), 10) || 1;
      } else if (group === 0x0020 && element === 0x0013) {
        // Instance Number
        metadata.instanceNumber = parseInt(readString(dataView, offset, length), 10) || 1;
      } else if (group === 0x0020 && element === 0x0032) {
        // Image Position (Patient)
        const parts = readString(dataView, offset, length).split('\\').map(Number);
        if (parts.length === 3) metadata.imagePositionPatient = [parts[0], parts[1], parts[2]];
      } else if (group === 0x0020 && element === 0x0037) {
        // Image Orientation (Patient)
        const parts = readString(dataView, offset, length).split('\\').map(Number);
        if (parts.length === 6) metadata.imageOrientationPatient = [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]];
      } else if (group === 0x0020 && element === 0x0060) {
        // Laterality
        metadata.laterality = readString(dataView, offset, length);
      } else if (group === 0x0028 && element === 0x0010) {
        // Rows
        metadata.rows = dataView.getUint16(offset, isLittleEndian);
      } else if (group === 0x0028 && element === 0x0011) {
        // Columns
        metadata.columns = dataView.getUint16(offset, isLittleEndian);
      } else if (group === 0x0028 && element === 0x0030) {
        // Pixel Spacing
        const parts = readString(dataView, offset, length).split('\\').map(Number);
        if (parts.length === 2) metadata.pixelSpacing = [parts[0], parts[1]];
      } else if (group === 0x0028 && element === 0x0100) {
        // Bits Allocated
        metadata.bitsAllocated = dataView.getUint16(offset, isLittleEndian);
      } else if (group === 0x0028 && element === 0x0101) {
        // Bits Stored
        metadata.bitsStored = dataView.getUint16(offset, isLittleEndian);
      } else if (group === 0x0028 && element === 0x0102) {
        // High Bit
        metadata.highBit = dataView.getUint16(offset, isLittleEndian);
      } else if (group === 0x0028 && element === 0x0103) {
        // Pixel Representation (0 = unsigned, 1 = 2's complement)
        metadata.pixelRepresentation = dataView.getUint16(offset, isLittleEndian);
      } else if (group === 0x0028 && element === 0x1050) {
        // Window Center
        metadata.windowCenter = parseFloat(readString(dataView, offset, length)) || undefined;
      } else if (group === 0x0028 && element === 0x1051) {
        // Window Width
        metadata.windowWidth = parseFloat(readString(dataView, offset, length)) || undefined;
      } else if (group === 0x7fe0 && element === 0x0010) {
        // Pixel Data!
        pixelDataOffset = offset;
        pixelDataLength = length;
        break;
      }

      offset += length;
    }

    // Default fallbacks if tags missing
    if (!metadata.sopInstanceUid) metadata.sopInstanceUid = `instance-${fileName}`;
    if (!metadata.seriesInstanceUid) metadata.seriesInstanceUid = 'series-default';
    if (!metadata.studyInstanceUid) metadata.studyInstanceUid = 'study-default';

    // Extract pixel buffer slice
    let pixelData: Uint8Array | Uint16Array | Int16Array | undefined;
    if (pixelDataOffset > 0 && pixelDataLength > 0) {
      if (metadata.bitsAllocated === 16) {
        const numPixels = metadata.rows * metadata.columns;
        if (metadata.pixelRepresentation === 1) {
          pixelData = new Int16Array(buffer, pixelDataOffset, Math.min(numPixels, Math.floor(pixelDataLength / 2)));
        } else {
          pixelData = new Uint16Array(buffer, pixelDataOffset, Math.min(numPixels, Math.floor(pixelDataLength / 2)));
        }
      } else {
        pixelData = new Uint8Array(buffer, pixelDataOffset, Math.min(metadata.rows * metadata.columns, pixelDataLength));
      }
    }

    const hasDicomContent = isPart10 || pixelDataOffset > 0 || metadata.modality === 'MR';
    const isNamedDicom = fileName.toLowerCase().endsWith('.dcm') || fileName.toLowerCase().endsWith('.ima');

    if (isNamedDicom && !hasDicomContent) {
      return {
        fileId: fileName,
        fileName,
        fileSize,
        sha256: '',
        isDicom: true,
        unreadable: true,
        errorMessage: 'Malformed DICOM header or corrupt byte stream.',
        metadata,
        pixelDataOffset: 0,
        pixelDataLength: 0,
      };
    }

    return {
      fileId: fileName,
      fileName,
      fileSize,
      sha256: '',
      isDicom: hasDicomContent,
      metadata,
      pixelDataOffset,
      pixelDataLength,
      pixelData,
    };
  } catch (err) {
    return {
      fileId: fileName,
      fileName,
      fileSize,
      sha256: '',
      isDicom: isPart10,
      unreadable: true,
      errorMessage: err instanceof Error ? err.message : 'Corrupt DICOM object',
      metadata,
      pixelDataOffset: 0,
      pixelDataLength: 0,
    };
  }
}

function readString(dataView: DataView, offset: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    const code = dataView.getUint8(offset + i);
    if (code === 0) break; // null terminator
    str += String.fromCharCode(code);
  }
  return str.trim();
}

function createEmptyMetadata(): DicomMetadata {
  return {
    sopInstanceUid: '',
    seriesInstanceUid: '',
    studyInstanceUid: '',
    modality: '',
    seriesDescription: '',
    instanceNumber: 1,
    rows: 256,
    columns: 256,
    bitsAllocated: 16,
    bitsStored: 12,
    highBit: 11,
    pixelRepresentation: 0,
    transferSyntaxUid: '1.2.840.10008.1.2.1', // Explicit VR Little Endian
  };
}
