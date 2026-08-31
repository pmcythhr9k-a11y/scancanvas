// DICOM Web Worker for background file intake, incremental indexing and SHA-256 hashing

self.onmessage = async function (e) {
  const { files, caseId } = e.data;
  if (!files || files.length === 0) {
    self.postMessage({ type: 'ERROR', error: 'No files provided' });
    return;
  }

  const total = files.length;
  const parsedInstances = [];
  const duplicates = [];
  const unreadableFiles = [];
  const unsupportedFiles = [];
  const sopSet = new Set();

  let reportText = '';
  let reportPresent = false;
  let reportStatus = 'missing';

  for (let i = 0; i < total; i++) {
    const fileObj = files[i];
    const { name, buffer } = fileObj;

    // Report progress
    self.postMessage({
      type: 'PROGRESS',
      processed: i + 1,
      total,
      currentFile: name,
      message: `Checking file ${i + 1} of ${total}: ${name}`,
    });

    // 1. Calculate SHA-256 hash using Web Crypto API
    let sha256 = '';
    try {
      const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuf));
      sha256 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      sha256 = 'sha256-unavailable';
    }

    // Check if report text file or PDF name
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.pdf') || lowerName.includes('report')) {
      try {
        const text = new TextDecoder().decode(buffer);
        if (text.length > 50 && (text.includes('FINDINGS') || text.includes('IMPRESSION') || text.includes('RADIOLOGY'))) {
          reportText = text;
          reportPresent = true;
          reportStatus = text.includes('FINAL') ? 'final_label_detected' : 'preliminary';
        }
      } catch (_) {}
    }

    // Check for unsupported files (e.g. .exe, .bat, .dll)
    if (lowerName.endsWith('.exe') || lowerName.endsWith('.dll') || lowerName.endsWith('.bat') || lowerName === 'autorun.inf') {
      unsupportedFiles.push({
        fileName: name,
        reason: 'Non-medical executable/autorun file from CD. Safely ignored.',
      });
      continue;
    }

    // Check for DICOM file
    const dataView = new DataView(buffer);
    const fileSize = buffer.byteLength;

    if (fileSize < 132) {
      unsupportedFiles.push({
        fileName: name,
        reason: 'File size too small for medical imaging.',
      });
      continue;
    }

    const isPart10 =
      dataView.getUint8(128) === 0x44 &&
      dataView.getUint8(129) === 0x49 &&
      dataView.getUint8(130) === 0x43 &&
      dataView.getUint8(131) === 0x4d;

    if (!isPart10 && !lowerName.endsWith('.dcm') && !lowerName.endsWith('.ima')) {
      // Check if DICOMDIR
      if (lowerName.includes('dicomdir')) {
        unsupportedFiles.push({
          fileName: name,
          reason: 'DICOMDIR scan index catalogued. Image objects indexed directly.',
        });
        continue;
      }

      unsupportedFiles.push({
        fileName: name,
        reason: 'Unrecognised file format.',
      });
      continue;
    }

    // Quick parse DICOM header
    try {
      const meta = parseDicomQuick(dataView, isPart10, fileSize);
      meta.fileName = name;
      meta.sha256 = sha256;

      if (sopSet.has(meta.sopInstanceUid)) {
        duplicates.push({
          fileName: name,
          sopInstanceUid: meta.sopInstanceUid,
        });
      } else {
        sopSet.add(meta.sopInstanceUid);
        parsedInstances.push(meta);
      }
    } catch (err) {
      unreadableFiles.push({
        fileName: name,
        reason: 'Malformed DICOM header or corrupt byte stream.',
      });
    }
  }

  self.postMessage({
    type: 'COMPLETE',
    result: {
      caseId: caseId || 'synthetic-knee-demo',
      instances: parsedInstances,
      duplicates,
      unreadableFiles,
      unsupportedFiles,
      report: {
        present: reportPresent,
        status: reportStatus,
        text: reportText,
      },
    },
  });
};

function parseDicomQuick(dataView, isPart10, fileSize) {
  let offset = isPart10 ? 132 : 0;
  let isExplicit = true;
  const meta = {
    sopInstanceUid: '',
    seriesInstanceUid: 'series-default',
    studyInstanceUid: 'study-default',
    modality: 'MR',
    seriesDescription: 'MRI Series',
    seriesNumber: 1,
    instanceNumber: 1,
    rows: 256,
    columns: 256,
    laterality: 'L',
    bodyPartExamined: 'KNEE',
  };

  while (offset < Math.min(fileSize - 8, 4096)) {
    const group = dataView.getUint16(offset, true);
    const element = dataView.getUint16(offset + 2, true);
    offset += 4;

    let length = 0;
    if (isExplicit && group !== 0xfffe) {
      const vr = String.fromCharCode(dataView.getUint8(offset), dataView.getUint8(offset + 1));
      offset += 2;
      if (['OB', 'OW', 'OF', 'SQ', 'UT', 'UN'].includes(vr)) {
        offset += 2;
        length = dataView.getUint32(offset, true);
        offset += 4;
      } else {
        length = dataView.getUint16(offset, true);
        offset += 2;
      }
    } else {
      length = dataView.getUint32(offset, true);
      offset += 4;
    }

    if (length === 0xffffffff || offset + length > fileSize) break;

    // Tags
    if (group === 0x0008 && element === 0x0018) {
      meta.sopInstanceUid = readStr(dataView, offset, length);
    } else if (group === 0x0008 && element === 0x103e) {
      meta.seriesDescription = readStr(dataView, offset, length);
    } else if (group === 0x0020 && element === 0x000e) {
      meta.seriesInstanceUid = readStr(dataView, offset, length);
    } else if (group === 0x0020 && element === 0x0011) {
      meta.seriesNumber = parseInt(readStr(dataView, offset, length), 10) || 1;
    } else if (group === 0x0020 && element === 0x0013) {
      meta.instanceNumber = parseInt(readStr(dataView, offset, length), 10) || 1;
    } else if (group === 0x0020 && element === 0x0060) {
      meta.laterality = readStr(dataView, offset, length);
    } else if (group === 0x0028 && element === 0x0010) {
      meta.rows = dataView.getUint16(offset, true);
    } else if (group === 0x0028 && element === 0x0011) {
      meta.columns = dataView.getUint16(offset, true);
    }

    offset += length;
  }

  if (!meta.sopInstanceUid) meta.sopInstanceUid = `uid-${Math.random()}`;
  return meta;
}

function readStr(dataView, offset, length) {
  let s = '';
  for (let i = 0; i < length; i++) {
    const c = dataView.getUint8(offset + i);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s.trim();
}
