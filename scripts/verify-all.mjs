// Comprehensive Automated Test & Verification Suite for ScanCanvas

import assert from 'node:assert';
import { generateSyntheticKneeDataset, createSyntheticDicomFile } from '../lib/dicom/synthetic-generator.js';
import { parseDicomHeader, classifySeries } from '../lib/dicom/parser.js';
import { checkMprEligibility, buildVoxelVolume, extractOrthogonalSlice } from '../lib/dicom/geometry.js';
import { verifyEvidenceCards } from '../lib/agent/verifier.js';
import { SYNTHETIC_FINAL_REPORT } from '../lib/fixtures/synthetic-reports.js';
import { calculateSha256 } from '../lib/export/hash.js';

console.log('🧪 Running ScanCanvas Automated Verification Tests...\n');

// TEST 1: DICOM Generator & Part 10 Header Parser
console.log('1. Testing DICOM Part 10 Generation & Parsing...');
const testFile = createSyntheticDicomFile(
  '1.2.826.0.1.3680043.8.498.15',
  '1.2.826.0.1.3680043.8.498.15.1',
  1,
  18,
  'Sagittal T2 FS',
  'sagittal',
  34
);
assert(testFile.buffer.byteLength > 1000, 'DICOM buffer must be generated with pixel data');

const parsed = parseDicomHeader(testFile.buffer, testFile.name);
assert.strictEqual(parsed.isDicom, true, 'Parser must identify DICOM Part 10 format');
assert.strictEqual(parsed.metadata.modality, 'MR', 'Modality must be MR');
assert.strictEqual(parsed.metadata.rows, 256, 'Rows must be 256');
assert.strictEqual(parsed.metadata.columns, 256, 'Columns must be 256');
assert.strictEqual(parsed.metadata.instanceNumber, 18, 'Instance number must match 18');
assert.strictEqual(parsed.metadata.laterality, 'L', 'Laterality must match L');
console.log('   ✅ DICOM Part 10 parser verified successfully.\n');

// TEST 2: Full Knee Dataset Generation & Duplicate Detection
console.log('2. Testing Synthetic Dataset Generation & Duplicate Detection...');
const dataset = generateSyntheticKneeDataset();
assert(dataset.length > 100, `Expected >100 generated test instances, got ${dataset.length}`);

const uids = new Set();
let duplicatesCount = 0;
let corruptCount = 0;
let unsupportedCount = 0;

for (const file of dataset) {
  if (file.name.endsWith('.EXE') || file.name === 'DICOMDIR') {
    unsupportedCount++;
    continue;
  }
  const res = parseDicomHeader(file.buffer, file.name);
  if (res.unreadable) {
    corruptCount++;
  } else if (res.isDicom) {
    if (uids.has(res.metadata.sopInstanceUid)) {
      duplicatesCount++;
    } else {
      uids.add(res.metadata.sopInstanceUid);
    }
  }
}

assert.strictEqual(duplicatesCount, 2, 'Must detect exactly 2 duplicate SOP instances');
assert.strictEqual(corruptCount, 1, 'Must detect exactly 1 corrupt DICOM file');
assert(unsupportedCount >= 2, 'Must detect non-medical launcher executables and DICOMDIR');
console.log(`   ✅ Correctly isolated ${duplicatesCount} duplicates, ${corruptCount} corrupt file, and ${unsupportedCount} non-imaging files.\n`);

// TEST 3: Series Classification & MPR Eligibility
console.log('3. Testing MPR Volume Geometry & Slicing...');
const sagSeries = dataset
  .filter((f) => f.name.startsWith('IMG_01_'))
  .map((f) => parseDicomHeader(f.buffer, f.name));

const mprCheck = checkMprEligibility(sagSeries);
assert.strictEqual(mprCheck.eligible, true, 'Sagittal 34-slice diagnostic stack must be MPR eligible');

const volume = buildVoxelVolume(sagSeries, 'sagittal');
assert(volume !== null, 'Volume3D must be built');
assert.strictEqual(volume.dimensions[2], sagSeries.length, 'Volume depth must match slice count');

const axialSlice = extractOrthogonalSlice(volume, 'axial', 18, 100, 100);
assert.strictEqual(axialSlice.length, 100 * 100 * 4, 'Extracted orthogonal slice must have correct RGBA buffer size');
console.log('   ✅ 3D Multiplanar reconstruction engine verified successfully.\n');

// TEST 4: Deterministic Evidence & Banned Claim Verifier
console.log('4. Testing Evidence Grounding & Banned Claim Safety Filter...');
const testCards = [
  {
    claimId: 'test-1',
    section: 'impression',
    sourceSpanId: 'imp:1',
    sourceSentence: 'High-grade partial thickness tear of the anterior cruciate ligament.',
    plainEnglish: 'The report describes many fibers of the ACL ligament as torn.',
    certaintyLanguage: 'none_explicit',
    negated: false,
    laterality: 'left',
    provenanceLabel: 'Directly stated in report',
    generalEducation: { title: 'ACL', explanation: 'Main stabilizing knee ligament.' },
    whatIsNotAnswered: ['Timeline'],
    suggestedQuestion: 'What does this mean for stability?',
    verifier: { sourceExists: true, meaningPreserved: true, bannedClaimDetected: false },
  },
  {
    claimId: 'test-2-banned',
    section: 'impression',
    sourceSpanId: 'imp:2',
    sourceSentence: 'Small-to-moderate reactive joint effusion.',
    plainEnglish: 'We diagnose severe disease with 95% probability and you should take ibuprofen immediately.',
    certaintyLanguage: 'none_explicit',
    negated: false,
    laterality: 'left',
    provenanceLabel: 'Faithfully simplified',
    generalEducation: { title: 'Effusion', explanation: 'Joint fluid.' },
    whatIsNotAnswered: [],
    suggestedQuestion: 'How long to heal?',
    verifier: { sourceExists: true, meaningPreserved: true, bannedClaimDetected: false },
  },
];

const verif = verifyEvidenceCards(testCards, SYNTHETIC_FINAL_REPORT.fullText);
assert.strictEqual(verif.cards[0].verifier.sourceExists, true, 'Card 1 source sentence must exist in report');
assert.strictEqual(verif.cards[0].verifier.bannedClaimDetected, false, 'Card 1 must pass banned claim check');
assert.strictEqual(verif.cards[1].verifier.bannedClaimDetected, true, 'Card 2 must be flagged for banned probability/prescription words');
console.log('   ✅ Deterministic safety verifier correctly passed faithful claim and flagged prohibited advice.\n');

// TEST 5: Cryptographic Hash Reproducibility
console.log('5. Testing Web Crypto SHA-256 Hash Function...');
const hash1 = await calculateSha256('ScanCanvas Zero Pixel Guarantee');
const hash2 = await calculateSha256('ScanCanvas Zero Pixel Guarantee');
assert.strictEqual(hash1, hash2, 'SHA-256 digests must be deterministic');
assert.strictEqual(hash1.length, 64, 'SHA-256 hex string must be 64 characters');
console.log('   ✅ Cryptographic hash calculations verified.\n');

console.log('🎉 ALL 5 TEST SUITES PASSED WITH 100% SUCCESS!\n');
