import { z } from 'zod';

export const analyzeDealInputSchema = {
  deal: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      description: z.string().nullable().optional(),

      value: z.number().nullable().optional(),
      currency: z.string().nullable().optional(),

      customerId: z.string().nullable().optional(),
      partnerId: z.string().nullable().optional(),

      partnerRole: z.string().nullable().optional(),
      product: z.string().nullable().optional(),

      stage: z.string().nullable().optional(),
      status: z.string().nullable().optional(),

      expectedCloseDate: z.string().nullable().optional(),
    })
    .describe('AllianceOS deal returned by getDeal'),
};

export async function analyzeDeal(input: {
  deal: {
    id?: string | null;
    name?: string | null;
    description?: string | null;

    value?: number | null;
    currency?: string | null;

    customerId?: string | null;
    partnerId?: string | null;

    partnerRole?: string | null;
    product?: string | null;

    stage?: string | null;
    status?: string | null;

    expectedCloseDate?: string | null;
  };
}) {
  const deal = input.deal;

  const value =
    typeof deal.value === 'number'
      ? deal.value
      : Number(deal.value ?? 0);

  const stage = String(deal.stage ?? '').toUpperCase();
  const status = String(deal.status ?? '').toUpperCase();
  const partnerRole = deal.partnerRole ?? null;

  const analysis = {
    dealId: deal.id ?? null,
    dealName: deal.name ?? null,

    commercial: {
      value,
      currency: deal.currency ?? 'USD',
      expectedCloseDate: deal.expectedCloseDate ?? null,
    },

    classification: {
      product: deal.product ?? null,
      partnerRole,
      stage,
      status,
    },

    customer: {
      customerId: deal.customerId ?? null,
      identified: Boolean(deal.customerId),
    },

    partner: {
      partnerId: deal.partnerId ?? null,
      identified: Boolean(deal.partnerId),
    },

    gtmAssessment: {
      requiresPartnerIdentification: !deal.partnerId,
      requiresCustomerIdentification: !deal.customerId,
      proposalReady: stage === 'PROPOSAL',
      approvalRequired: true,
      outreachReady:
        Boolean(deal.customerId) &&
        Boolean(deal.partnerId),
    },

    recommendedNextActions: [
      ...(!deal.customerId
        ? ['Identify and associate the customer']
        : []),

      ...(!deal.partnerId
        ? ['Find and associate a suitable partner']
        : []),

      ...(stage === 'DISCOVERY'
        ? ['Complete discovery and qualify the opportunity']
        : []),

      'Prepare GTM proposal',
      'Generate partner/customer outreach',
      'Submit generated content for approval',
    ],
  };

  return analysis;
}