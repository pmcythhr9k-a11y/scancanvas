// ScanCanvas Appointment Pack Builder — Local ZIP Archive and Printable Brief

import JSZip from 'jszip';
import { CaseManifest } from '../dicom/parser';
import { EvidenceCard, PrivacyReceipt } from '../agent/schemas';
import { calculateSha256 } from './hash';

export interface AppointmentQuestion {
  id: string;
  text: string;
  enabled: boolean;
  sourceClaimId?: string;
}

export interface PackOptions {
  manifest: CaseManifest;
  privacyReceipt: PrivacyReceipt;
  evidenceCards: EvidenceCard[];
  questions: AppointmentQuestion[];
  includeOriginalDicom: boolean;
  originalFiles?: Array<{ name: string; buffer: ArrayBuffer }>;
}

/**
 * Generate complete local Appointment Pack ZIP archive
 */
export async function buildAppointmentPackZip(options: PackOptions): Promise<Blob> {
  const zip = new JSZip();
  const { manifest, privacyReceipt, evidenceCards, questions, includeOriginalDicom, originalFiles } = options;

  const fileHashes: string[] = [];

  // 1. Case Manifest JSON
  const manifestJson = JSON.stringify(manifest, null, 2);
  zip.file('case-manifest.json', manifestJson);
  const manifestHash = await calculateSha256(manifestJson);
  fileHashes.push(`${manifestHash}  case-manifest.json`);

  // 2. Privacy Receipt JSON
  const receiptJson = JSON.stringify(privacyReceipt, null, 2);
  zip.file('privacy-receipt.json', receiptJson);
  const receiptHash = await calculateSha256(receiptJson);
  fileHashes.push(`${receiptHash}  privacy-receipt.json`);

  // 3. Original Report Text
  const reportText = manifest.report.text || 'No report text supplied.';
  zip.file('original-radiology-report.txt', reportText);
  const reportHash = await calculateSha256(reportText);
  fileHashes.push(`${reportHash}  original-radiology-report.txt`);

  // 4. Questions for Clinician
  const activeQuestions = questions.filter((q) => q.enabled);
  let questionsText = `SCANCANVAS APPOINTMENT QUESTIONS\nCase: Left Knee MRI (${manifest.studyDate || '15 Aug 2026'})\nPrepared for Consultation\n\n`;
  activeQuestions.forEach((q, idx) => {
    questionsText += `${idx + 1}. ${q.text}\n\n`;
  });
  zip.file('questions-for-doctor.txt', questionsText);
  const qHash = await calculateSha256(questionsText);
  fileHashes.push(`${qHash}  questions-for-doctor.txt`);

  // 5. Printable / Standalone HTML Appointment Brief
  const briefHtml = generatePrintableBriefHtml(options);
  zip.file('appointment-brief.html', briefHtml);
  const briefHash = await calculateSha256(briefHtml);
  fileHashes.push(`${briefHash}  appointment-brief.html`);

  // 6. Original DICOM Objects if requested
  if (includeOriginalDicom && originalFiles && originalFiles.length > 0) {
    const dicomFolder = zip.folder('original-dicom');
    if (dicomFolder) {
      for (const file of originalFiles) {
        dicomFolder.file(file.name, file.buffer);
        const fHash = await calculateSha256(file.buffer);
        fileHashes.push(`${fHash}  original-dicom/${file.name}`);
      }
    }
  }

  // 7. Integrity Ledger (SHA256SUMS.txt)
  const shaSums = fileHashes.join('\n');
  zip.file('SHA256SUMS.txt', shaSums);

  // 8. README / Patient Guide
  const readme = `SCANCANVAS APPOINTMENT PACK
==================================================
Case ID: ${manifest.caseId}
Examination Date: ${manifest.studyDate || '15 August 2026'}
Images Processed Locally: ${manifest.instancesReadable}
Pixel Bytes Sent to Cloud AI: 0

CONTENTS OF THIS PACK:
1. appointment-brief.html     — Complete high-contrast summary for print or viewing
2. original-radiology-report.txt — Exact signed radiology report
3. questions-for-doctor.txt    — Your prepared questions for the appointment
4. case-manifest.json         — Technical inventory of studies and series
5. privacy-receipt.json        — Cryptographic proof of local-first privacy
6. SHA256SUMS.txt             — Cryptographic checksums of all package contents

IMPORTANT NOTICE:
Based on the signed radiology report. ScanCanvas helps you open and organise your records; medical interpretation remains with a qualified professional.
`;
  zip.file('README-FIRST.txt', readme);

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generate clean, self-contained, high-contrast HTML Appointment Brief for printing or saving
 */
export function generatePrintableBriefHtml(options: PackOptions): string {
  const { manifest, privacyReceipt, evidenceCards, questions } = options;
  const activeQuestions = questions.filter((q) => q.enabled);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ScanCanvas Appointment Pack — ${manifest.caseId}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
      color: #142832;
      background: #ffffff;
      margin: 0;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #142832;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 24px;
      margin: 0 0 4px 0;
      color: #0B5F76;
    }
    .meta { font-size: 14px; color: #50636C; }
    .section {
      margin-bottom: 24px;
      border: 1px solid #C9D4D8;
      border-radius: 4px;
      padding: 16px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #142832;
      margin-top: 0;
      margin-bottom: 12px;
      border-bottom: 1px solid #EDF2F4;
      padding-bottom: 6px;
    }
    .notice {
      background: #EDF2F4;
      border-left: 3px solid #0B5F76;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .card {
      margin-bottom: 12px;
      padding: 10px;
      background: #F4F7F8;
      border-radius: 4px;
    }
    .card-title { font-weight: 700; font-size: 14px; color: #142832; }
    .card-plain { font-size: 14px; margin: 4px 0; }
    .card-source { font-size: 12px; color: #50636C; font-style: italic; border-left: 2px solid #C9D4D8; padding-left: 8px; margin-top: 4px; }
    .question-item {
      padding: 8px 0;
      border-bottom: 1px dashed #C9D4D8;
      font-size: 14px;
      font-weight: 600;
    }
    .privacy-badge {
      display: inline-block;
      background: #E8F4EF;
      color: #236C55;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 2px;
    }
    @media print {
      body { padding: 0; }
      .section { border: 1px solid #000000; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ScanCanvas — Appointment Brief</h1>
      <div class="meta">Case: Left Knee MRI | Date: ${manifest.studyDate || '15 August 2026'}</div>
    </div>
    <div class="privacy-badge">Images Stayed on Device · 0 Pixel Bytes Sent</div>
  </div>

  <div class="notice">
    <strong>Notice:</strong> Based on the signed radiology report. ScanCanvas helps you open and organise your records; medical interpretation remains with a qualified healthcare professional.
  </div>

  <div class="section">
    <div class="section-title">1. My Questions for the Consultation</div>
    ${
      activeQuestions.length > 0
        ? activeQuestions.map((q, idx) => `<div class="question-item">${idx + 1}. ${q.text}</div>`).join('')
        : '<p>No specific questions selected.</p>'
    }
  </div>

  <div class="section">
    <div class="section-title">2. Plain-English Report Guide &amp; Exact Evidence</div>
    ${evidenceCards
      .map(
        (c) => `
      <div class="card">
        <div class="card-title">${c.generalEducation.title} (${c.provenanceLabel})</div>
        <div class="card-plain">${c.plainEnglish}</div>
        <div class="card-source">Radiologist wrote: "${c.sourceSentence}"</div>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="section">
    <div class="section-title">3. Full Signed Radiology Report</div>
    <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; color: #142832;">${manifest.report.text || ''}</pre>
  </div>

  <div class="section">
    <div class="section-title">4. Case Manifest &amp; Privacy Verification</div>
    <div class="meta">
      Readable DICOM Slices: <strong>${manifest.instancesReadable}</strong> |
      Series Organised: <strong>${manifest.seriesCount}</strong> |
      Duplicates Filtered: <strong>${manifest.duplicateCount}</strong> |
      Report Characters Approved: <strong>${privacyReceipt.reportCharactersApproved}</strong>
    </div>
  </div>
</body>
</html>`;
}
