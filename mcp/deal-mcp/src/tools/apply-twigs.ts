import { z } from 'zod';

/**
 * =========================================================
 * INPUT SCHEMA
 * =========================================================
 */

export const applyTwigsInputSchema = {
  proposal: z
    .object({
      dealId: z.string().nullable().optional(),
      status: z.string().optional(),

      proposal: z
        .object({
          title: z.string().optional(),

          executiveSummary:
            z.string().optional(),

          customerProblem:
            z.string().optional(),

          solution:
            z.string().optional(),

          partner: z
            .unknown()
            .nullable()
            .optional(),

          commercials: z
            .unknown()
            .nullable()
            .optional(),

          currentStage:
            z.string().optional(),

          nextSteps:
            z.array(z.string()).optional(),
        })
        .passthrough(),
    })
    .passthrough()
    .describe(
      'Existing GTM proposal to modify',
    ),

  twigs: z
    .array(
      z.object({
        id: z
          .string()
          .min(1)
          .describe(
            'Unique twig identifier',
          ),

        field: z
          .enum([
            'title',
            'executiveSummary',
            'customerProblem',
            'solution',
            'nextSteps',
          ])
          .describe(
            'Proposal field that should be modified',
          ),

        instruction: z
          .string()
          .min(1)
          .describe(
            'Modification instruction',
          ),

        value: z
          .string()
          .optional()
          .describe(
            'Optional explicit value to apply',
          ),

        required: z
          .boolean()
          .default(false)
          .describe(
            'Whether this twig must be successfully applied',
          ),

        source: z
          .string()
          .optional()
          .describe(
            'Source of the modification, such as voice-dump, Google Drive, user instruction, or CRM',
          ),
      }),
    )
    .min(1)
    .describe(
      'List of proposal modifications to apply',
    ),
};

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type Twig = {
  id: string;

  field:
    | 'title'
    | 'executiveSummary'
    | 'customerProblem'
    | 'solution'
    | 'nextSteps';

  instruction: string;

  value?: string;

  required?: boolean;

  source?: string;
};

type Proposal = {
  dealId?: string | null;

  status?: string;

  proposal: {
    title?: string;

    executiveSummary?: string;

    customerProblem?: string;

    solution?: string;

    partner?: unknown;

    commercials?: unknown;

    currentStage?: string;

    nextSteps?: string[];
  };

  [key: string]: unknown;
};

/**
 * =========================================================
 * APPLY TWIGS
 * =========================================================
 */

export async function applyTwigs(
  input: {
    proposal: Proposal;
    twigs: Twig[];
  },
) {
  /**
   * Clone the proposal so the original object
   * is not mutated directly.
   */
  const updatedProposal: Proposal =
    structuredClone(input.proposal);

  const appliedTwigs: Array<{
    twigId: string;
    field: string;
    instruction: string;
    source: string | null;
    status: 'APPLIED';
  }> = [];

  const failedTwigs: Array<{
    twigId: string;
    field: string;
    instruction: string;
    source: string | null;
    status: 'FAILED';
    reason: string;
  }> = [];

  /**
   * =======================================================
   * PROCESS EACH TWIG
   * =======================================================
   */

  for (const twig of input.twigs) {
    try {
      const currentValue =
        updatedProposal.proposal[
          twig.field
        ];

      /**
       * ---------------------------------------------------
       * EXPLICIT VALUE
       * ---------------------------------------------------
       *
       * If the caller provides a value, use it directly.
       */

      if (
        twig.value !== undefined
      ) {
        if (
          twig.field ===
          'nextSteps'
        ) {
          updatedProposal.proposal.nextSteps =
            [
              ...(updatedProposal.proposal
                .nextSteps ?? []),
              twig.value,
            ];
        } else {
          updatedProposal.proposal[
            twig.field
          ] = twig.value;
        }

        appliedTwigs.push({
          twigId: twig.id,
          field: twig.field,
          instruction:
            twig.instruction,
          source:
            twig.source ?? null,
          status: 'APPLIED',
        });

        continue;
      }

      /**
       * ---------------------------------------------------
       * NEXT STEPS
       * ---------------------------------------------------
       */

      if (
        twig.field ===
        'nextSteps'
      ) {
        updatedProposal.proposal.nextSteps =
          [
            ...(updatedProposal.proposal
              .nextSteps ?? []),
            twig.instruction,
          ];

        appliedTwigs.push({
          twigId: twig.id,
          field: twig.field,
          instruction:
            twig.instruction,
          source:
            twig.source ?? null,
          status: 'APPLIED',
        });

        continue;
      }

      /**
       * ---------------------------------------------------
       * STRING FIELDS
       * ---------------------------------------------------
       */

      const existingText =
        typeof currentValue ===
        'string'
          ? currentValue
          : '';

      /**
       * For now, an instruction without
       * an explicit value is appended.
       *
       * Later this is the point where
       * the LLM/AI agent will interpret
       * the instruction and rewrite the
       * complete field.
       */

      updatedProposal.proposal[
        twig.field
      ] = existingText
        ? `${existingText}\n\n${twig.instruction}`
        : twig.instruction;

      appliedTwigs.push({
        twigId: twig.id,
        field: twig.field,
        instruction:
          twig.instruction,
        source:
          twig.source ?? null,
        status: 'APPLIED',
      });
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      failedTwigs.push({
        twigId: twig.id,
        field: twig.field,
        instruction:
          twig.instruction,
        source:
          twig.source ?? null,
        status: 'FAILED',
        reason,
      });

      if (twig.required) {
        throw new Error(
          `Required twig "${twig.id}" failed: ${reason}`,
        );
      }
    }
  }

  /**
   * =======================================================
   * RESULT
   * =======================================================
   */

  return {
    dealId:
      updatedProposal.dealId ??
      null,

    status:
      updatedProposal.status ??
      'DRAFT',

    proposal:
      updatedProposal.proposal,

    twigExecution: {
      total:
        input.twigs.length,

      applied:
        appliedTwigs.length,

      failed:
        failedTwigs.length,

      status:
        failedTwigs.length === 0
          ? 'SUCCESS'
          : 'PARTIAL_SUCCESS',

      appliedTwigs,

      failedTwigs,
    },

    audit: {
      modifiedAt:
        new Date().toISOString(),

      modificationCount:
        appliedTwigs.length,

      sourceTypes: [
        ...new Set(
          input.twigs
            .map(
              (twig) =>
                twig.source,
            )
            .filter(
              (
                source,
              ): source is string =>
                Boolean(source),
            ),
        ),
      ],
    },
  };
}