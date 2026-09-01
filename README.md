# ScanCanvas — Private MRI Record Workspace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Privacy: Zero-Pixel Local](https://img.shields.io/badge/Privacy-Zero--Pixel%20Local-236C55.svg)](https://github.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run%20Ready-4285F4.svg)](https://cloud.google.com/run)

**ScanCanvas** is a responsive web application that helps patients open and organise an exported MRI folder, understand their signed radiology report wording through deterministic evidence grounding, prepare consultation questions, and export a verifiable **Appointment Pack**.

---

## 🧭 Core Highlights

* **Zero-Pixel Privacy Architecture**: 100% of MRI DICOM pixel bytes remain strictly local in the browser. Zero image bytes are sent to cloud AI services.
* **PACS-Grade Interactive Viewer**: Multi-planar slice navigation across Sagittal, Coronal, and Axial series with pan, zoom, brightness/contrast windowing, and keyboard navigation (`Arrow keys`, `+`, `-`, `0`).
* **Synchronized 3-View Orthogonal MPR**: Reconstructs Axial, Coronal, and Sagittal orthogonal cross-sections with linked crosshairs whenever DICOM orientation geometry qualifies.
* **Deterministic Evidence Thread**: 100% of simplified plain-English statements link directly to an exact signed report sentence via the *"Show exact wording"* action.
* **Strict Clinical Scope Filter**: Deterministically rejects speculative diagnoses, urgency scoring, disease probabilities, and treatment recommendations.
* **Neutral Change Timeline**: Compares multi-year reports while returning safe refusals rather than over-interpreting descriptive variations.
* **Appointment Pack Builder**: Generates an editable questions list, printable high-contrast brief, and complete `.ZIP` container with original unmodified DICOM files and cryptographic checksums.

---

## 🤖 AI Models & Engineering Methodology

* **Core Agent Workflow:** Built using **Gemini 3.7 Flash** for high-throughput, low-latency report explanation, structured JSON output generation, and real-time deterministic schema validation.
* **Extended Reasoning & Multi-Turn Research:** Tested and validated using **Gemini 3.1 Pro** for complex multi-series radiological comparisons, longitudinal report trajectory modeling, and safety edge-case evaluation.
* **Deterministic Verification Layer:** An offline deterministic verifier cross-references every AI-generated claim against exact signed report spans, enforcing zero hallucinations and rejecting prohibited clinical claims prior to patient rendering.

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    subgraph Client ["Client Browser Runtime (Zero-Pixel Boundary)"]
        A[Exported MRI Folder / ZIP / DICOM] --> B[Web Worker DICOM Intake & SHA-256]
        B --> C[Package Readiness Audit (Case Check)]
        C --> D[PACS MRI Viewer & 3D MPR Engine]
        C --> E[Signed Report Text Preview]
        E -->|Explicit User Approval| F[Outbound Text Payload]
        D -.->|Zero Pixel Bytes Transmitted| F
    end

    subgraph Cloud ["Google Cloud Run (Text-Only Analysis)"]
        F --> G[Gemini 3.7 Flash Agent Workflow]
        G --> H[Deterministic Source-Span Verifier]
        H --> I[Provenance Event Ledger]
    end

    subgraph Output ["Patient Consultation Handoff"]
        H --> J[Report Guide & Evidence Thread]
        J --> K[Appointment Pack Builder]
        K --> L[Printable Brief & Verifiable ZIP Export]
    end
```

---

## 📚 Clinical Case & Educational Citations

ScanCanvas grounds its anatomical models, imaging sequences, and educational descriptions in established peer-reviewed radiological literature and open datasets:

1. **Radiopaedia.org**
   * *Article*: [Anterior Cruciate Ligament Tear](https://radiopaedia.org/articles/anterior-cruciate-ligament-tear?lang=gb) (Article ID 10927)
   * *Authors*: Dr. Frank Gaillard, Dr. Henry Knipe, et al.
   * *Reference Signs*: Sagittal fiber discontinuity, Blumensaat line alignment, empty notch sign, and pivot-shift bone contusion patterns in the anterior lateral femoral condyle and posterior lateral tibial plateau.
   * *License*: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 (CC BY-NC-SA 3.0).

2. **Clinical Hospital Centre Rijeka / KneeMRI Dataset**
   * *Authors*: Štajduhar et al. — [Zenodo Record 4505353](https://zenodo.org/records/4505353) / Kaggle.
   * *Description*: Annotated knee MRI benchmark for cruciate ligament evaluation.
   * *License*: Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0).

3. **Mendeley Data ACL-PCL Multi-View Dataset**
   * *Description*: Multi-planar knee MRI collection across sagittal, coronal, and axial sequences.
   * *License*: Creative Commons Attribution 4.0 International (CC BY 4.0).

4. **RadiologyInfo.org & NHS Health A-Z**
   * Patient educational definitions for musculoskeletal MRI and knee joint anatomy.

---

## 🚀 Quick Start

### Prerequisites
* Node.js `v20+` or `v24+`
* npm `v10+`

### Installation & Local Run
```bash
# 1. Clone repository
git clone https://github.com/pmcythhr9k-a11y/scancanvas.git
cd scancanvas

# 2. Install dependencies
npm install

# 3. Run automated verification test suite
npx tsx scripts/verify-all.ts

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suite

ScanCanvas includes automated verification tests covering DICOM parsing, geometry, verifier safety, and cryptographic determinism:

```bash
npx tsx scripts/verify-all.ts
```

**Verification Results:**
- ✅ **Test 1**: DICOM Part 10 Header & Transfer Syntax Parsing
- ✅ **Test 2**: Synthetic Knee Dataset & Duplicate/Fault Isolation
- ✅ **Test 3**: 3D Multiplanar Reconstruction (MPR) Voxel Slicing
- ✅ **Test 4**: Deterministic Evidence Grounding & Banned-Claim Safety Filter
- ✅ **Test 5**: Web Crypto SHA-256 Determinism
- ✅ **Test 6**: Real-Life Intake Scenarios (Hospital CD, Portal ZIP, Mixed IMA)

---

## ☁️ Google Cloud Run Deployment

The project includes a production multi-stage `Dockerfile`:

```bash
# Build and deploy to Google Cloud Run
gcloud run deploy scancanvas \
  --source . \
  --project YOUR_PROJECT_ID \
  --region europe-west2 \
  --allow-unauthenticated
```

---

## 📜 Medical & Privacy Notice

> **ScanCanvas is an informational, patient-facing organisation and communication tool.**
> It does not provide medical diagnosis, calculate disease probability, estimate urgency, or recommend clinical treatments. Medical interpretation remains strictly with qualified healthcare professionals.
