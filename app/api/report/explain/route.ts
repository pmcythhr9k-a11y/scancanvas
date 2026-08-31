import { NextRequest, NextResponse } from 'next/server';
import { runReportExplanationWorkflow } from '@/lib/agent/gemini';
import { recordCaseProvenance } from '@/lib/agent/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportText, caseId = 'SC-CASE-LEFT-KNEE-2026' } = body;

    if (!reportText || typeof reportText !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid reportText' }, { status: 400 });
    }

    // Execute agent explanation workflow
    const result = await runReportExplanationWorkflow(reportText, caseId);

    // Record Firestore provenance checkpoint
    await recordCaseProvenance(
      caseId,
      {
        step: 'EVIDENCE_EXTRACTED_AND_VERIFIED',
        timestamp: new Date().toISOString(),
        status: 'completed',
        details: `Verified ${result.verificationSummary.verifiedClaims} of ${result.verificationSummary.totalClaims} source-linked claims with zero pixel upload.`,
      },
      'VERIFIED',
      {
        imagesCount: 135,
        reportChars: reportText.length,
      }
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error in /api/report/explain:', err);
    return NextResponse.json(
      { error: 'Internal server error in report explanation workflow' },
      { status: 500 }
    );
  }
}
