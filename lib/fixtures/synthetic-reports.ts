// Human-authored synthetic knee MRI radiology reports for ScanCanvas demonstration

export interface SyntheticReport {
  id: string;
  title: string;
  date: string;
  status: 'FINAL' | 'PRELIMINARY' | 'AMENDED';
  bodyPart: string;
  laterality: 'LEFT' | 'RIGHT';
  patientName: string;
  patientId: string;
  radiologist: string;
  fullText: string;
  sections: {
    clinicalIndication: string;
    technique: string;
    findings: {
      menisci: string;
      cruciateLigaments: string;
      collateralLigaments: string;
      extensorMechanism: string;
      jointEffusionAndBones: string;
    };
    impression: string;
  };
  sentences: string[];
}

export const SYNTHETIC_FINAL_REPORT: SyntheticReport = {
  id: 'SYNTH-REPORT-2026-FINAL',
  title: 'MRI LEFT KNEE — FINAL RADIOLOGY REPORT',
  date: '15 August 2026',
  status: 'FINAL',
  bodyPart: 'Knee',
  laterality: 'LEFT',
  patientName: 'Demo Patient (Synthetic)',
  patientId: 'SC-2026-08-15',
  radiologist: 'Dr. E. Vance, FRCR (Synthetic Identifier)',
  fullText: `CLINICAL INDICATION:
28-year-old adult presenting with left knee instability, acute twisting injury during recreational sport 10 days ago, persistent swelling.

TECHNIQUE:
Multiplanar, multisequence MRI of the left knee performed on a 3.0T system without intravenous contrast. Sequences include Sagittal PD FS (Side view), Coronal PD FS (Front view · fluid-sensitive), Coronal T1 (Front view · high-resolution anatomy), and Axial PD FS (Cross-section).

FINDINGS:
Menisci: No displaced or complex meniscal tear is identified. The medial and lateral meniscal bodies demonstrate normal low signal morphology without surface disruption.

Cruciate Ligaments: High-grade partial thickness tear of the anterior cruciate ligament (ACL) with discontinuous mid-substance fibres and oedema. Some contiguous distal fibres remain visualized. The posterior cruciate ligament (PCL) is intact with normal configuration.

Collateral Ligaments: The medial collateral ligament (MCL) and lateral collateral ligament (LCL) complexes are intact without evidence of discrete disruption or significant sprain.

Extensor Mechanism: Quadriceps tendon and patellar tendon are intact. Patellofemoral cartilage is preserved without focal full-thickness defect.

Joint Effusion & Bone Marrow: Small-to-moderate joint effusion noted in the suprapatellar pouch. Associated bone marrow oedema is present within the lateral femoral condyle and posterior lateral tibial plateau, suggestive of a typical contusion pattern.

IMPRESSION:
1. High-grade partial thickness tear of the anterior cruciate ligament.
2. Bone marrow oedema within the lateral femoral condyle and posterior lateral tibial plateau, likely reflecting an impaction bone contusion.
3. Small-to-moderate reactive joint effusion.
4. No displaced meniscal tear identified.

Report Status: FINAL
Signed: Dr. E. Vance, Consultant Radiologist (15-Aug-2026 14:32 UTC)`,
  sections: {
    clinicalIndication: '28-year-old adult presenting with left knee instability, acute twisting injury during recreational sport 10 days ago, persistent swelling.',
    technique: 'Multiplanar, multisequence MRI of the left knee performed on a 3.0T system without intravenous contrast. Sequences include Sagittal PD FS (Side view), Coronal PD FS (Front view · fluid-sensitive), Coronal T1 (Front view · high-resolution anatomy), and Axial PD FS (Cross-section).',
    findings: {
      menisci: 'No displaced or complex meniscal tear is identified. The medial and lateral meniscal bodies demonstrate normal low signal morphology without surface disruption.',
      cruciateLigaments: 'High-grade partial thickness tear of the anterior cruciate ligament (ACL) with discontinuous mid-substance fibres and oedema. Some contiguous distal fibres remain visualized. The posterior cruciate ligament (PCL) is intact with normal configuration.',
      collateralLigaments: 'The medial collateral ligament (MCL) and lateral collateral ligament (LCL) complexes are intact without evidence of discrete disruption or significant sprain.',
      extensorMechanism: 'Quadriceps tendon and patellar tendon are intact. Patellofemoral cartilage is preserved without focal full-thickness defect.',
      jointEffusionAndBones: 'Small-to-moderate joint effusion noted in the suprapatellar pouch. Associated bone marrow oedema is present within the lateral femoral condyle and posterior lateral tibial plateau, suggestive of a typical contusion pattern.',
    },
    impression: '1. High-grade partial thickness tear of the anterior cruciate ligament.\n2. Bone marrow oedema within the lateral femoral condyle and posterior lateral tibial plateau, likely reflecting an impaction bone contusion.\n3. Small-to-moderate reactive joint effusion.\n4. No displaced meniscal tear identified.',
  },
  sentences: [
    '28-year-old adult presenting with left knee instability, acute twisting injury during recreational sport 10 days ago, persistent swelling.',
    'Multiplanar, multisequence MRI of the left knee performed on a 3.0T system without intravenous contrast.',
    'Sequences include Sagittal PD FS (Side view), Coronal PD FS (Front view · fluid-sensitive), Coronal T1 (Front view · high-resolution anatomy), and Axial PD FS (Cross-section).',
    'No displaced or complex meniscal tear is identified.',
    'The medial and lateral meniscal bodies demonstrate normal low signal morphology without surface disruption.',
    'High-grade partial thickness tear of the anterior cruciate ligament (ACL) with discontinuous mid-substance fibres and oedema.',
    'Some contiguous distal fibres remain visualized.',
    'The posterior cruciate ligament (PCL) is intact with normal configuration.',
    'The medial collateral ligament (MCL) and lateral collateral ligament (LCL) complexes are intact without evidence of discrete disruption or significant sprain.',
    'Quadriceps tendon and patellar tendon are intact.',
    'Patellofemoral cartilage is preserved without focal full-thickness defect.',
    'Small-to-moderate joint effusion noted in the suprapatellar pouch.',
    'Associated bone marrow oedema is present within the lateral femoral condyle and posterior lateral tibial plateau, suggestive of a typical contusion pattern.',
    'High-grade partial thickness tear of the anterior cruciate ligament.',
    'Bone marrow oedema within the lateral femoral condyle and posterior lateral tibial plateau, likely reflecting an impaction bone contusion.',
    'Small-to-moderate reactive joint effusion.',
    'No displaced meniscal tear identified.',
  ],
};

export const SYNTHETIC_EARLIER_REPORT: SyntheticReport = {
  id: 'SYNTH-REPORT-2025-EARLIER',
  title: 'MRI LEFT KNEE — PRIOR RADIOLOGY REPORT (HISTORICAL BASELINE)',
  date: '03 March 2025',
  status: 'FINAL',
  bodyPart: 'Knee',
  laterality: 'LEFT',
  patientName: 'Demo Patient (Synthetic)',
  patientId: 'SC-2026-08-15',
  radiologist: 'Dr. M. Albright, FRCR (Synthetic Identifier)',
  fullText: `CLINICAL INDICATION:
Left anterior knee pain following minor stumble. No overt instability.

TECHNIQUE:
MRI left knee 1.5T routine protocol.

FINDINGS:
Cruciate Ligaments: The anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) are intact with normal continuous low signal trajectory.
Menisci: Grossly intact menisci.
Effusion & Bone: Mild trace joint effusion. No focal bone contusion or marrow oedema identified.

IMPRESSION:
1. Normal intact anterior cruciate ligament.
2. Trace physiological joint effusion. No acute structural disruption.

Report Status: FINAL
Signed: Dr. M. Albright (03-Mar-2025 11:15 UTC)`,
  sections: {
    clinicalIndication: 'Left anterior knee pain following minor stumble. No overt instability.',
    technique: 'MRI left knee 1.5T routine protocol.',
    findings: {
      menisci: 'Grossly intact menisci.',
      cruciateLigaments: 'The anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) are intact with normal continuous low signal trajectory.',
      collateralLigaments: 'Collaterals intact.',
      extensorMechanism: 'Intact.',
      jointEffusionAndBones: 'Mild trace joint effusion. No focal bone contusion or marrow oedema identified.',
    },
    impression: '1. Normal intact anterior cruciate ligament.\n2. Trace physiological joint effusion. No acute structural disruption.',
  },
  sentences: [
    'Left anterior knee pain following minor stumble.',
    'The anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) are intact with normal continuous low signal trajectory.',
    'Grossly intact menisci.',
    'Mild trace joint effusion.',
    'No focal bone contusion or marrow oedema identified.',
    'Normal intact anterior cruciate ligament.',
    'Trace physiological joint effusion.',
    'No acute structural disruption.',
  ],
};
