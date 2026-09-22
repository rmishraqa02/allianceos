import { z } from 'zod';

import { askOllama } from '../ollama-client.js';

export const generateTwigsInputSchema = {
  deal: z
    .record(z.string(), z.unknown())
    .describe('AllianceOS deal data'),

  proposal: z
    .record(z.string(), z.unknown())
    .describe('Generated proposal'),

  context: z
    .string()
    .min(1)
    .describe(
      'Business context, meeting notes, voice dump, or customer requirements',
    ),
};

type Twig = {
  id: string;
  field: string;
  instruction: string;
  required: boolean;
  source: string;
};

type AiTwigResponse = {
  twigs?: Twig[];
};

export async function generateTwigs(input: {
  deal: Record<string, unknown>;
  proposal: Record<string, unknown>;
  context: string;
}) {
  const prompt = `
You are an AI GTM Twig Agent for AllianceOS.

A "Twig" is an internal modification instruction that tells another
AI agent how to modify a proposal or email.

Your job is NOT to write the proposal.
Your job is to identify the changes that are required based on the
business context and create structured Twig instructions.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do not use markdown.
3. Do not write the final proposal.
4. Do not write the final email.
5. Create a Twig only when a real modification is required.
6. Each Twig must target a specific proposal field.
7. Keep Twig instructions concise and actionable.
8. Never invent customer facts.
9. Never invent pricing, dates, metrics, commitments, or products.
10. Preserve facts already present in the deal and proposal.
11. Twig instructions are INTERNAL and must never become customer-facing text.
12. Prefer existing fields such as:
    - executiveSummary
    - customerProblem
    - solution
    - partner
    - commercials
    - nextSteps
13. Use source "ai-twig-agent".
14. Use required=true when the modification is explicitly required by the context.
15. If no modification is required, return an empty twigs array.

Expected JSON format:

{
  "twigs": [
    {
      "id": "twig-001",
      "field": "executiveSummary",
      "instruction": "Emphasize the joint value of the proposed AllianceOS and partner solution.",
      "required": true,
      "source": "ai-twig-agent"
    }
  ]
}

DEAL:
${JSON.stringify(input.deal, null, 2)}

PROPOSAL:
${JSON.stringify(input.proposal, null, 2)}

BUSINESS CONTEXT:
${input.context}
`;

  const raw = await askOllama(prompt);

  const parsed = parseAiResponse(raw);

  const twigs = normalizeTwigs(parsed);

  return {
    twigs,
    count: twigs.length,
    source: 'ai-twig-agent',
    generatedAt: new Date().toISOString(),
  };
}

function parseAiResponse(raw: string): AiTwigResponse {
  let text = raw.trim();

  text = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(text) as AiTwigResponse;
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start >= 0 && end > start) {
      try {
        return JSON.parse(
          text.substring(start, end + 1),
        ) as AiTwigResponse;
      } catch {
        throw new Error(
          `AI Twig Agent returned invalid JSON: ${raw}`,
        );
      }
    }

    throw new Error(
      `AI Twig Agent returned invalid JSON: ${raw}`,
    );
  }
}

function normalizeTwigs(
  response: AiTwigResponse,
): Twig[] {
  if (!Array.isArray(response.twigs)) {
    return [];
  }

  return response.twigs
    .filter(
      (twig) =>
        twig &&
        typeof twig.field === 'string' &&
        twig.field.trim() &&
        typeof twig.instruction === 'string' &&
        twig.instruction.trim(),
    )
    .map((twig, index) => ({
      id:
        typeof twig.id === 'string' &&
        twig.id.trim()
          ? twig.id
          : `twig-${String(index + 1).padStart(3, '0')}`,

      field: twig.field.trim(),

      instruction:
        twig.instruction.trim(),

      required:
        twig.required !== false,

      source:
        'ai-twig-agent',
    }));
}
