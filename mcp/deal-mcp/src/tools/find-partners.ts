import { z } from 'zod';

import { AllianceOSApiClient } from '../api-client.js';

/**
 * =========================================================
 * INPUT SCHEMA
 * =========================================================
 */

export const findPartnersInputSchema = {
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
    })
    .describe(
      'AllianceOS deal context used to identify suitable partners',
    ),

  token: z
    .string()
    .min(1)
    .describe(
      'AllianceOS JWT access token',
    ),
};

/**
 * =========================================================
 * TYPES
 * =========================================================
 */

type DealContext = {
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
};

type Partner = {
  id: string;
  name: string;

  description?: string | null;
  website?: string | null;

  status?: string | null;

  partnerTypeId?: string | null;
  tierId?: string | null;
  statusId?: string | null;
  industryId?: string | null;
  regionId?: string | null;

  capabilityIds?: string[];
};

type PartnerDetails = Partner & {
  capabilityIds?: string[];
};

type PartnerListResponse =
  Partner[];

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function normalize(
  value?: string | null,
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function containsMatch(
  source: string,
  target: string,
): boolean {
  if (!source || !target) {
    return false;
  }

  return (
    source.includes(target) ||
    target.includes(source)
  );
}

/**
 * =========================================================
 * PARTNER SCORING
 * =========================================================
 *
 * Current scoring is based only on information that
 * actually exists in the Deal + Partner models.
 *
 * We do NOT invent a direct PartnerRole relationship.
 */

function scorePartner(
  partner: Partner,
  deal: DealContext,
) {
  let score = 0;

  const reasons: string[] = [];

  const partnerText = [
    partner.name,
    partner.description,
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(value),
    )
    .join(' ')
    .toLowerCase();

  const product =
    normalize(deal.product);

  const partnerRole =
    normalize(deal.partnerRole);

  /**
   * -------------------------------------------------------
   * 1. PRODUCT RELEVANCE
   * -------------------------------------------------------
   */

  if (product) {
    const productWords =
      product
        .split(/\s+/)
        .map((word) =>
          word.trim(),
        )
        .filter(
          (word) =>
            word.length >= 3 &&
            ![
              'the',
              'and',
              'for',
              'with',
              'allianceos',
            ].includes(word),
        );

    const matchingProductWords =
      productWords.filter(
        (word) =>
          partnerText.includes(word),
      );

    if (
      matchingProductWords.length > 0
    ) {
      score += 30;

      reasons.push(
        `Product relevance detected: ${matchingProductWords.join(', ')}`,
      );
    }
  }

  /**
   * -------------------------------------------------------
   * 2. PARTNER ROLE RELEVANCE
   * -------------------------------------------------------
   *
   * Deal has partnerRole, but Partner currently doesn't
   * have a corresponding role field.
   *
   * Therefore we only use partner profile text.
   */

  if (partnerRole) {
    if (
      containsMatch(
        partnerText,
        partnerRole,
      )
    ) {
      score += 25;

      reasons.push(
        `Partner profile is relevant to ${deal.partnerRole}`,
      );
    }
  }

  /**
   * -------------------------------------------------------
   * 3. TECHNOLOGY / ENTERPRISE RELEVANCE
   * -------------------------------------------------------
   */

  const relevanceKeywords = [
    'ai',
    'artificial intelligence',
    'machine learning',
    'platform',
    'enterprise',
    'cloud',
    'technology',
  ];

  const matchingKeywords =
    relevanceKeywords.filter(
      (keyword) =>
        partnerText.includes(
          keyword,
        ),
    );

  if (
    matchingKeywords.length > 0
  ) {
    const keywordScore =
      Math.min(
        matchingKeywords.length * 5,
        20,
      );

    score += keywordScore;

    reasons.push(
      `Relevant profile keywords: ${matchingKeywords.join(', ')}`,
    );
  }

  /**
   * -------------------------------------------------------
   * 4. ACTIVE PARTNER
   * -------------------------------------------------------
   */

  if (
    normalize(partner.status) ===
    'active'
  ) {
    score += 10;

    reasons.push(
      'Partner is active',
    );
  }

  /**
   * -------------------------------------------------------
   * 5. CONFIGURED CAPABILITIES
   * -------------------------------------------------------
   *
   * We currently don't have required capability IDs
   * on Deal, so we don't claim an exact capability match.
   */

  const capabilityCount =
    partner.capabilityIds
      ?.length ?? 0;

  if (capabilityCount > 0) {
    score += 10;

    reasons.push(
      `${capabilityCount} configured partner capabilities`,
    );
  }

  return {
    score: Math.min(
      score,
      100,
    ),

    reasons,
  };
}

/**
 * =========================================================
 * FIND PARTNERS
 * =========================================================
 */

export async function findPartners(
  input: {
    deal: DealContext;
    token: string;
  },
) {
  const client =
    new AllianceOSApiClient(
      input.token,
    );

  /**
   * -------------------------------------------------------
   * STEP 1
   * Get partners for the authenticated tenant.
   * -------------------------------------------------------
   */

  const partnersResponse =
    (await client.get(
      '/partners',
    )) as PartnerListResponse;

  const partners: Partner[] =
    Array.isArray(
      partnersResponse,
    )
      ? partnersResponse
      : [];

  /**
   * -------------------------------------------------------
   * STEP 2
   * Enrich each partner with capability IDs.
   * -------------------------------------------------------
   *
   * GET /partners
   *      -> base Partner
   *
   * GET /partners/:id
   *      -> Partner + capabilityIds
   */

  const enrichedPartners: Partner[] =
    await Promise.all(
      partners.map(
        async (
          partner,
        ): Promise<Partner> => {
          try {
            const details =
              (await client.get(
                `/partners/${partner.id}`,
              )) as PartnerDetails;

            return {
              ...partner,

              capabilityIds:
                Array.isArray(
                  details.capabilityIds,
                )
                  ? details.capabilityIds
                  : [],
            };
          } catch {
            /**
             * Don't fail the complete search
             * because one partner couldn't be
             * enriched.
             */

            return {
              ...partner,
              capabilityIds: [],
            };
          }
        },
      ),
    );

  /**
   * -------------------------------------------------------
   * STEP 3
   * Score and rank partners.
   * -------------------------------------------------------
   */

  const rankedPartners =
    enrichedPartners
      .map(
        (
          partner,
        ) => {
          const result =
            scorePartner(
              partner,
              input.deal,
            );

          return {
            partnerId:
              partner.id,

            name:
              partner.name,

            description:
              partner.description ??
              null,

            website:
              partner.website ??
              null,

            partnerTypeId:
              partner.partnerTypeId ??
              null,

            tierId:
              partner.tierId ??
              null,

            statusId:
              partner.statusId ??
              null,

            industryId:
              partner.industryId ??
              null,

            regionId:
              partner.regionId ??
              null,

            capabilityIds:
              partner.capabilityIds ??
              [],

            matchScore:
              result.score,

            matchReasons:
              result.reasons,
          };
        },
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.matchScore -
          a.matchScore,
      );

  /**
   * -------------------------------------------------------
   * STEP 4
   * Return structured GTM result.
   * -------------------------------------------------------
   */

  return {
    dealId:
      input.deal.id ??
      null,

    dealName:
      input.deal.name ??
      null,

    matchingCriteria: {
      product:
        input.deal.product ??
        null,

      partnerRole:
        input.deal.partnerRole ??
        null,

      stage:
        input.deal.stage ??
        null,

      status:
        input.deal.status ??
        null,
    },

    totalPartnersEvaluated:
      rankedPartners.length,

    candidates:
      rankedPartners,
  };
}