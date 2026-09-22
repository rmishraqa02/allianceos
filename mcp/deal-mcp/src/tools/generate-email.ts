import { z } from 'zod';

/**
 * =========================================================
 * INPUT SCHEMA
 * =========================================================
 */

export const generateEmailInputSchema = {
  deal: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      description: z.string().nullable().optional(),

      value: z.number().nullable().optional(),
      currency: z.string().nullable().optional(),

      partnerRole: z.string().nullable().optional(),
      product: z.string().nullable().optional(),

      stage: z.string().nullable().optional(),
      status: z.string().nullable().optional(),

      customerId: z.string().nullable().optional(),
      partnerId: z.string().nullable().optional(),
    })
    .passthrough()
    .describe(
      'AllianceOS deal used to generate the outreach email',
    ),

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

          partner:
            z.unknown().nullable().optional(),

          commercials:
            z.unknown().nullable().optional(),

          currentStage:
            z.string().optional(),

          nextSteps:
            z.array(z.string()).optional(),
        })
        .passthrough(),
    })
    .passthrough()
    .describe(
      'Final or modified GTM proposal used to generate the email',
    ),

  twigs: z
    .array(
      z.object({
        id: z.string(),

        field: z.string(),

        instruction: z.string(),

        value: z.string().optional(),

        source: z.string().optional(),
      }),
    )
    .optional()
    .default([])
    .describe(
      'Proposal modifications that should be reflected in the email',
    ),

  recipientType: z
    .enum([
      'PARTNER',
      'CUSTOMER',
    ])
    .default('PARTNER')
    .describe(
      'Type of recipient for the outreach email',
    ),

  recipientName: z
    .string()
    .optional()
    .describe(
      'Optional recipient or organization name',
    ),
};

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type Deal = {
  id?: string | null;
  name?: string | null;
  description?: string | null;

  value?: number | null;
  currency?: string | null;

  partnerRole?: string | null;
  product?: string | null;

  stage?: string | null;
  status?: string | null;

  customerId?: string | null;
  partnerId?: string | null;
};

type Proposal = {
  dealId?: string | null;

  status?: string;

  proposal: {
    title?: string;

    executiveSummary?:
      string;

    customerProblem?:
      string;

    solution?:
      string;

    partner?: unknown;

    commercials?: unknown;

    currentStage?:
      string;

    nextSteps?:
      string[];
  };
};

type Twig = {
  id: string;

  field: string;

  instruction: string;

  value?: string;

  source?: string;
};

/**
 * =========================================================
 * EMAIL GENERATOR
 * =========================================================
 */

export async function generateEmail(
  input: {
    deal: Deal;
    proposal: Proposal;
    twigs?: Twig[];

    recipientType?:
      | 'PARTNER'
      | 'CUSTOMER';

    recipientName?: string;
  },
) {
  const {
    deal,
    proposal,
  } = input;

  const twigs =
    input.twigs ?? [];

  const recipientType =
    input.recipientType ??
    'PARTNER';

  const recipientName =
    input.recipientName ??
    (recipientType === 'PARTNER'
      ? 'Partner Team'
      : 'Customer Team');

  const product =
    deal.product ??
    'AllianceOS Platform';

  const partnerRole =
    deal.partnerRole ??
    'Partner';

  const proposalTitle =
    proposal.proposal.title ??
    `${product} - ${partnerRole} Proposal`;

  const executiveSummary =
    proposal.proposal
      .executiveSummary ??
    '';

  const solution =
    proposal.proposal.solution ??
    '';

  /**
   * =======================================================
   * SUBJECT
   * =======================================================
   */

  const subject =
    recipientType === 'PARTNER'
      ? `AllianceOS Co-Sell Opportunity - ${product}`
      : `AllianceOS Proposal - ${product}`;

  /**
   * =======================================================
   * INTRODUCTION
   * =======================================================
   */

  const greeting =
    `Hi ${recipientName},`;

  const introduction =
    recipientType === 'PARTNER'
      ? `We would like to discuss a potential ${partnerRole.toLowerCase()} opportunity with your team around ${product}.`
      : `We would like to share the proposed approach for the ${product} opportunity.`;

  /**
   * =======================================================
   * PROPOSAL CONTEXT
   * =======================================================
   */

  const proposalContext =
    executiveSummary;

  /**
   * =======================================================
   * SOLUTION
   * =======================================================
   */

  const solutionSection =
    solution;

  /**
   * =======================================================
   * TWIG CONTEXT
   * =======================================================
   */

  const twigSection =
    twigs.length > 0
      ? [
          'The following requirements have been incorporated into the proposal:',
          '',
          ...twigs.map(
            (twig) =>
              `- ${twig.value ?? twig.instruction}`,
          ),
        ].join('\n')
      : '';

  /**
   * =======================================================
   * CLOSING
   * =======================================================
   */

  const closing =
    recipientType === 'PARTNER'
      ? `Please review the opportunity and let us know a suitable time to discuss the engagement, solution scope, and next steps.`
      : `Please review the proposal and let us know if you would like to discuss the solution, scope, and next steps.`;

  const signature =
    `Regards,\nAllianceOS Team`;

  /**
   * =======================================================
   * EMAIL BODY
   * =======================================================
   */

  const body = [
    greeting,
    '',
    introduction,
    '',
    proposalContext,
    '',
    solutionSection,
    '',
    twigSection,
    '',
    closing,
    '',
    signature,
  ]
    .filter(
      (section) =>
        section.trim().length > 0,
    )
    .join('\n');

  /**
   * =======================================================
   * RESULT
   * =======================================================
   */

  return {
    dealId:
      deal.id ??
      proposal.dealId ??
      null,

    status: 'DRAFT',

    email: {
      recipientType,

      recipientName,

      to: [],

      subject,

      body,

      proposalTitle,

      generatedAt:
        new Date().toISOString(),
    },

    context: {
      dealName:
        deal.name ?? null,

      product,

      partnerRole,

      stage:
        deal.stage ?? null,

      proposalStatus:
        proposal.status ?? 'DRAFT',

      appliedTwigCount:
        twigs.length,

      twigs: twigs.map(
        (twig) => ({
          id: twig.id,
          field: twig.field,
          source:
            twig.source ?? null,
        }),
      ),
    },

    approval: {
      required: true,
      status: 'PENDING',
    },
  };
}