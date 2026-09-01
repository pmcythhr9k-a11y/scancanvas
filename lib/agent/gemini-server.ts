// Server-only Gemini / Vertex AI model call.
// Imported exclusively from API routes. Never import this from client components:
// it carries the system prompt and reads project configuration from the environment.

import { EvidenceCard } from './schemas';

export async function callGeminiModel(reportText: string): Promise<EvidenceCard[] | null> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'europe-west2';
  const modelName = 'gemini-3.7-flash'; // active Vertex AI model endpoint

  // Live generation is only attempted when the service is configured with a project.
  if (!projectId) return null;

  const prompt = `You are a specialized medical-record explanation assistant for ScanCanvas.
Analyze the following signed radiology report text. Convert the findings into faithful, everyday-language explanation cards.

CRITICAL NON-NEGOTIABLE SAFETY RULES:
1. Do NOT diagnose conditions or create new findings not in the text.
2. Do NOT generate disease probabilities, severity scores, urgency estimates, or triage levels.
3. Do NOT recommend treatments, surgery, medications, exercises, or return-to-sport advice.
4. Preserve all uncertainty words exactly (e.g. "possible", "likely", "suggestive of", "cannot exclude", "partial").
5. Every single explanation MUST include the exact source sentence quoted verbatim from the report in "sourceSentence".
6. In "whatIsNotAnswered", explicitly list what the radiologist did not address (e.g., treatment plan, timeline).
7. In "suggestedQuestion", create a calm question the patient can ask their doctor.

REPORT TEXT:
${reportText}

Return a valid JSON array of objects with the schema:
[
  {
    "claimId": "string",
    "section": "impression" | "findings" | "technique" | "clinical_indication",
    "sourceSpanId": "string",
    "sourceSentence": "exact verbatim quote from report",
    "plainEnglish": "faithful everyday explanation",
    "certaintyLanguage": "possible" | "likely" | "suggestive_of" | "cannot_exclude" | "none_explicit" | "normal",
    "negated": boolean,
    "laterality": "left" | "right" | "bilateral" | "unspecified",
    "provenanceLabel": "Directly stated in report" | "Faithfully simplified",
    "generalEducation": {
      "title": "Anatomy/Term title",
      "explanation": "Neutral anatomical definition",
      "trustedUrl": "optional URL"
    },
    "whatIsNotAnswered": ["string"],
    "suggestedQuestion": "string",
    "verifier": {
      "sourceExists": true,
      "meaningPreserved": true,
      "bannedClaimDetected": false
    }
  }
]`;

  if (typeof fetch === 'undefined') return null;

  // Placeholder for the Vertex AI request using Application Default Credentials.
  // Until wired, the workflow falls back to the deterministic gold-verified cards.
  void location; void modelName; void prompt;
  return null;
}
