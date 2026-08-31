// Deterministic Evidence and Safety Verification Engine

import { EvidenceCard } from './schemas';

export interface VerificationResult {
  valid: boolean;
  cards: EvidenceCard[];
  rejectedCount: number;
  reasons: string[];
}

const BANNED_PATTERNS = [
  // Banned diagnosis & severity claims
  /\b(we diagnose|definitive diagnosis of|you have confirmed|you have severe disease)\b/i,
  // Banned disease probability numbers
  /\b(\d+%\s*(risk|probability|chance|confidence|likelihood)|probability score of)\b/i,
  // Banned treatment / exercise / return-to-activity advice
  /\b(you should take|prescribe|undergo surgery|start exercising|return to sport|stop walking|take medication|apply ice for)\b/i,
  // Banned triage / urgency estimates
  /\b(emergency triage|urgent danger|life-threatening|immediate hospital admission required)\b/i,
];

/**
 * Clean text for robust matching
 */
function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .replace(/["“”'‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verify evidence cards against the source report text
 */
export function verifyEvidenceCards(cards: EvidenceCard[], approvedReportText: string): VerificationResult {
  const normReport = normalizeForMatch(approvedReportText);
  const validatedCards: EvidenceCard[] = [];
  const reasons: string[] = [];
  let rejectedCount = 0;

  for (const card of cards) {
    let sourceExists = false;
    let bannedClaimDetected = false;
    let meaningPreserved = true;

    // 1. Exact or normalized source span check
    const normSource = normalizeForMatch(card.sourceSentence);
    if (approvedReportText.includes(card.sourceSentence) || normReport.includes(normSource)) {
      sourceExists = true;
    } else {
      reasons.push(`Source sentence not found in approved report for claim: "${card.sourceSentence.slice(0, 40)}..."`);
    }

    // 2. Banned pattern check on generated plain English
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(card.plainEnglish)) {
        bannedClaimDetected = true;
        reasons.push(`Banned clinical recommendation or probability detected in: "${card.plainEnglish.slice(0, 40)}..."`);
        break;
      }
    }

    // 3. Preserve uncertainty terms
    const normSourceWords = normSource.toLowerCase();
    const normPlainWords = card.plainEnglish.toLowerCase();

    if (
      (normSourceWords.includes('suggestive') && !normPlainWords.includes('suggest') && !normPlainWords.includes('likely') && !normPlainWords.includes('thought to be')) ||
      (normSourceWords.includes('likely') && !normPlainWords.includes('likely') && !normPlainWords.includes('suggest') && !normPlainWords.includes('probable')) ||
      (normSourceWords.includes('partial') && (normPlainWords.includes('complete tear') || normPlainWords.includes('all fibers')))
    ) {
      meaningPreserved = false;
      reasons.push(`Uncertainty qualifier ("likely" / "suggestive of" / "partial") altered in plain English.`);
    }

    const isCardValid = sourceExists && !bannedClaimDetected && meaningPreserved;

    validatedCards.push({
      ...card,
      verifier: {
        sourceExists,
        meaningPreserved,
        bannedClaimDetected,
      },
    });

    if (!isCardValid) {
      rejectedCount++;
    }
  }

  return {
    valid: rejectedCount === 0,
    cards: validatedCards,
    rejectedCount,
    reasons,
  };
}
