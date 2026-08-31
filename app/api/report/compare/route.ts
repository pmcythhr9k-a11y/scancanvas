import { NextRequest, NextResponse } from 'next/server';
import { ChangeTimelineItem } from '@/lib/agent/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { earlierReportText, currentReportText } = body;

    const items: ChangeTimelineItem[] = [
      {
        id: 'change-001-acl',
        finding: 'Anterior Cruciate Ligament (ACL)',
        earlierDate: '03 Mar 2025',
        earlierQuote: 'The anterior cruciate ligament (ACL) and posterior cruciate ligament (PCL) are intact with normal continuous low signal trajectory.',
        currentDate: '15 Aug 2026',
        currentQuote: 'High-grade partial thickness tear of the anterior cruciate ligament with discontinuous mid-substance fibres and oedema.',
        classification: 'newly_mentioned',
        plainExplanation: 'The prior 2025 report explicitly described an intact ligament. The current 2026 report newly mentions a high-grade partial tear.',
        isRefusal: false,
      },
      {
        id: 'change-002-bone-marrow',
        finding: 'Bone Marrow Oedema / Contusion',
        earlierDate: '03 Mar 2025',
        earlierQuote: 'No focal bone contusion or marrow oedema identified.',
        currentDate: '15 Aug 2026',
        currentQuote: 'Bone marrow oedema within the lateral femoral condyle and posterior lateral tibial plateau, likely reflecting an impaction bone contusion.',
        classification: 'newly_mentioned',
        plainExplanation: 'The prior report noted no bone contusion. The current report newly describes reactive bone marrow edema following acute twisting trauma.',
        isRefusal: false,
      },
      {
        id: 'change-003-meniscus-refusal',
        finding: 'Meniscal Morphology Comparison',
        earlierDate: '03 Mar 2025',
        earlierQuote: 'Grossly intact menisci.',
        currentDate: '15 Aug 2026',
        currentQuote: 'No displaced or complex meniscal tear is identified. The medial and lateral meniscal bodies demonstrate normal low signal morphology without surface disruption.',
        classification: 'not_safely_comparable',
        plainExplanation: 'Meniscal wording cannot be compared reliably. The earlier report used a generalized summary ("Grossly intact"), while the current report provides specific anatomical sub-compartment detail. The system conservatively refuses to over-interpret slight phrasing variations as clinical changes.',
        isRefusal: true,
        refusalReason: 'Level of descriptive detail differs significantly between reports.',
      },
    ];

    return NextResponse.json({
      status: 'success',
      comparisonItems: items,
      refusalCount: 1,
    });
  } catch (err) {
    console.error('Error in /api/report/compare:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
