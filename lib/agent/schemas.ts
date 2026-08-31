// Structured data schemas for ScanCanvas agent workflow, evidence cards and provenance

import { z } from 'zod';

export const ExternalReferenceSchema = z.object({
  sourceName: z.string(),
  title: z.string(),
  url: z.string(),
  matchScore: z.number().min(0).max(100),
});

export type ExternalReference = z.infer<typeof ExternalReferenceSchema>;

export const EvidenceCardSchema = z.object({
  claimId: z.string(),
  section: z.enum(['impression', 'findings', 'technique', 'clinical_indication']),
  sourceSpanId: z.string(),
  sourceSentence: z.string().min(3),
  plainEnglish: z.string().min(5),
  certaintyLanguage: z.enum([
    'possible',
    'likely',
    'suggestive_of',
    'cannot_exclude',
    'none_explicit',
    'intact',
    'normal',
  ]),
  negated: z.boolean(),
  laterality: z.enum(['left', 'right', 'bilateral', 'unspecified']),
  provenanceLabel: z.enum(['Directly stated in report', 'Faithfully simplified', 'Report-linked']),
  generalEducation: z.object({
    title: z.string(),
    explanation: z.string(),
    trustedUrl: z.string().optional(),
  }),
  clinicalMatchScore: z.number().optional(),
  peerPrevalence: z.string().optional(),
  everydayAnalogy: z.string().optional(),
  whyRadiologistsReportThis: z.string().optional(),
  externalReferences: z.array(ExternalReferenceSchema).optional(),
  whatIsNotAnswered: z.array(z.string()),
  suggestedQuestion: z.string(),
  verifier: z.object({
    sourceExists: z.boolean(),
    meaningPreserved: z.boolean(),
    bannedClaimDetected: z.boolean(),
  }),
});

export type EvidenceCard = z.infer<typeof EvidenceCardSchema>;

export const ChangeTimelineItemSchema = z.object({
  id: z.string(),
  finding: z.string(),
  earlierDate: z.string(),
  earlierQuote: z.string(),
  currentDate: z.string(),
  currentQuote: z.string(),
  classification: z.enum([
    'newly_mentioned',
    'still_mentioned',
    'wording_changed',
    'not_mentioned_later',
    'not_safely_comparable',
  ]),
  plainExplanation: z.string(),
  isRefusal: z.boolean(),
  refusalReason: z.string().optional(),
});

export type ChangeTimelineItem = z.infer<typeof ChangeTimelineItemSchema>;

export const PrivacyReceiptSchema = z.object({
  receiptVersion: z.string(),
  dicomObjectsProcessedLocally: z.number(),
  imagePixelBytesSentToCloud: z.number(),
  dicomMetadataSentToCloud: z.number(),
  reportCharactersApproved: z.number(),
  reportTextSha256: z.string(),
  approvedAt: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  policyVersion: z.string(),
});

export type PrivacyReceipt = z.infer<typeof PrivacyReceiptSchema>;

export const ExecutionTelemetrySchema = z.object({
  model: z.string(),
  provider: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  latencyMs: z.number(),
  estimatedCostUsd: z.number(),
  imageTokensCharged: z.literal(0),
  costBreakdown: z.object({
    inputCostUsd: z.number(),
    outputCostUsd: z.number(),
    unitRates: z.string(),
  }),
  timestamp: z.string(),
});

export type ExecutionTelemetry = z.infer<typeof ExecutionTelemetrySchema>;

export const ReportExplanationResponseSchema = z.object({
  reportVersion: z.string(),
  status: z.enum(['verified', 'rejected', 'paused_needs_review']),
  caseId: z.string(),
  cards: z.array(EvidenceCardSchema),
  patientNotice: z.string(),
  verificationSummary: z.object({
    totalClaims: z.number(),
    verifiedClaims: z.number(),
    rejectedClaims: z.number(),
    zeroPixelVerified: z.boolean(),
  }),
  telemetry: ExecutionTelemetrySchema.optional(),
});

export type ReportExplanationResponse = z.infer<typeof ReportExplanationResponseSchema>;
