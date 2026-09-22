import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { McpClientService } from './mcp-client.service.js';

type Deal = Record<string, unknown>;
type Analysis = Record<string, unknown>;
type PartnerResult = Record<string, unknown>;
type Proposal = Record<string, unknown>;
type TwigResult = Record<string, unknown>;
type TwigGenerationResult = Record<string, unknown>;
type EmailResult = Record<string, unknown>;

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

type GtmStep = {
  step: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
};

@Injectable()
export class GtmService {
  private readonly logger = new Logger(
    GtmService.name,
  );

  constructor(
    private readonly mcpClient: McpClientService,
  ) {}

  async run(
    dealId: string,
    token: string,
    context?: string,
  ) {
    const startedAt =
      new Date().toISOString();

    const steps: GtmStep[] = [];

    // =====================================================
    // 1. GET DEAL
    // =====================================================

    const dealStepStarted =
      new Date().toISOString();

    let deal: Deal;

    try {
      deal =
        await this.mcpClient.callTool<Deal>(
          'get_deal',
          {
            dealId,
            token,
          },
        );

      steps.push({
        step: 'get_deal',
        status: 'SUCCESS',
        startedAt: dealStepStarted,
        completedAt:
          new Date().toISOString(),
        output: deal,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'get_deal',
        error,
      );
    }

    // =====================================================
    // 2. ANALYZE DEAL
    // =====================================================

    const analysisStepStarted =
      new Date().toISOString();

    let analysis: Analysis;

    try {
      analysis =
        await this.mcpClient.callTool<Analysis>(
          'analyze_deal',
          {
            deal,
          },
        );

      steps.push({
        step: 'analyze_deal',
        status: 'SUCCESS',
        startedAt:
          analysisStepStarted,
        completedAt:
          new Date().toISOString(),
        output: analysis,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'analyze_deal',
        error,
      );
    }

    // =====================================================
    // 3. FIND PARTNERS
    // =====================================================

    const partnerStepStarted =
      new Date().toISOString();

    let partnerResult: PartnerResult;

    try {
      partnerResult =
        await this.mcpClient.callTool<PartnerResult>(
          'find_partners',
          {
            deal,
            token,
          },
        );

      steps.push({
        step: 'find_partners',
        status: 'SUCCESS',
        startedAt: partnerStepStarted,
        completedAt:
          new Date().toISOString(),
        output: partnerResult,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'find_partners',
        error,
      );
    }

    // =====================================================
    // SELECT TOP PARTNER
    // =====================================================

    const partner =
      this.extractTopPartner(
        partnerResult,
      );

    // =====================================================
    // 4. GENERATE PROPOSAL
    // =====================================================

    const proposalStepStarted =
      new Date().toISOString();

    let proposal: Proposal;

    try {
      proposal =
        await this.mcpClient.callTool<Proposal>(
          'generate_proposal',
          {
            deal,
            analysis,
            partner,
          },
        );

      steps.push({
        step: 'generate_proposal',
        status: 'SUCCESS',
        startedAt: proposalStepStarted,
        completedAt:
          new Date().toISOString(),
        output: proposal,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'generate_proposal',
        error,
      );
    }

    // =====================================================
    // 5. GENERATE AI TWIGS
    // =====================================================
    //
    // Twig Agent analyzes:
    //
    // Deal
    // Analysis
    // Partner
    // Proposal
    // Voice Dump / Meeting Context
    //
    // and identifies required modifications.
    //
    // =====================================================

    const twigGenerationStepStarted =
      new Date().toISOString();

    let twigGenerationResult:
      TwigGenerationResult;

    let twigs: Twig[] = [];

    try {
      const twigContext =
        this.buildTwigContext(
          deal,
          analysis,
          partner,
          context,
        );

      twigGenerationResult =
        await this.mcpClient.callTool<TwigGenerationResult>(
          'generate_twigs',
          {
            deal,
            proposal,
            context: twigContext,
          },
        );

      twigs =
        this.extractGeneratedTwigs(
          twigGenerationResult,
        );

      steps.push({
        step: 'generate_twigs',
        status: 'SUCCESS',
        startedAt:
          twigGenerationStepStarted,
        completedAt:
          new Date().toISOString(),
        output:
          twigGenerationResult,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'generate_twigs',
        error,
      );
    }

    // =====================================================
    // 6. APPLY AI TWIGS
    // =====================================================

    const twigStepStarted =
      new Date().toISOString();

    let twigResult: TwigResult;

    try {
      twigResult =
        await this.mcpClient.callTool<TwigResult>(
          'apply_twigs',
          {
            proposal,
            twigs,
          },
        );

      steps.push({
        step: 'apply_twigs',
        status: 'SUCCESS',
        startedAt:
          twigStepStarted,
        completedAt:
          new Date().toISOString(),
        output: twigResult,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'apply_twigs',
        error,
      );
    }

    // =====================================================
    // BUILD FINAL PROPOSAL
    // =====================================================

    const updatedProposal =
      this.extractTwigProposal(
        twigResult,
      );

    const finalProposal: Proposal = {
      ...proposal,

      proposal:
        updatedProposal ??
        (proposal as any).proposal,
    };

    // =====================================================
    // 7. GENERATE EMAIL
    // =====================================================

    const emailStepStarted =
      new Date().toISOString();

    let emailResult: EmailResult;

    try {
      emailResult =
        await this.mcpClient.callTool<EmailResult>(
          'generate_email',
          {
            deal,
            proposal: finalProposal,

            // Twig instructions are supplied only
            // for internal generation context.
            //
            // generate_email must NOT expose the
            // Twig instructions to the customer.
            twigs,

            recipientType: 'PARTNER',

            recipientName:
              this.extractPartnerName(
                partner,
              ),
          },
        );

      steps.push({
        step: 'generate_email',
        status: 'SUCCESS',
        startedAt: emailStepStarted,
        completedAt:
          new Date().toISOString(),
        output: emailResult,
      });
    } catch (error) {
      return this.failedRun(
        dealId,
        startedAt,
        steps,
        'generate_email',
        error,
      );
    }

    // =====================================================
    // FINAL RESULT
    // =====================================================

    return {
      runId: randomUUID(),

      dealId,

      status: 'PENDING_APPROVAL',

      currentStep: 'approval',

      startedAt,

      completedAt:
        new Date().toISOString(),

      steps,

      deal,

      analysis,

      partners: partnerResult,

      selectedPartner: partner,

      proposal: finalProposal,

      // AI-generated Twig information is retained
      // for internal audit/debugging.
      twigs,

      twigGeneration:
        twigGenerationResult,

      twigExecution:
        twigResult,

      email:
        emailResult,

      approval: {
        required: true,
        status: 'PENDING',
      },

      message:
        'GTM workflow completed using the AllianceOS Deal MCP and AI Twig Agent and is waiting for approval.',
    };
  }

  // =====================================================
  // BUILD TWIG CONTEXT
  // =====================================================

  private buildTwigContext(
    deal: Deal,
    analysis: Analysis,
    partner: unknown,
    externalContext?: string,
  ): string {
    const partnerName =
      this.extractPartnerName(
        partner,
      );

    const external =
      externalContext?.trim()
        ? externalContext.trim()
        : 'No external voice dump or meeting context was provided.';

    return [
      'GTM workflow context:',
      '',

      'The proposal is being prepared for an enterprise AI co-sell opportunity.',
      '',

      `Deal: ${String(
        deal.name ?? 'Unknown deal',
      )}`,

      `Product: ${String(
        deal.product ?? 'Unknown product',
      )}`,

      `Partner Role: ${String(
        deal.partnerRole ??
          'Unknown partner role',
      )}`,

      `Stage: ${String(
        deal.stage ?? 'Unknown stage',
      )}`,

      `Partner: ${
        partnerName ??
        'Selected partner'
      }`,

      '',

      'External business context:',
      external,

      '',

      'Analyze the available deal, analysis, partner, proposal, and external business context.',

      'Identify only the proposal modifications that are genuinely required.',

      'Create a Twig only when the business context requires a modification.',

      'Do not invent customer facts, pricing, dates, metrics, commitments, or products.',

      'Keep Twig instructions internal.',

      'Do not expose Twig instructions to the customer.',

      '',

      `Analysis: ${JSON.stringify(
        analysis,
      )}`,
    ].join('\n');
  }

  // =====================================================
  // EXTRACT AI GENERATED TWIGS
  // =====================================================

  private extractGeneratedTwigs(
    result: TwigGenerationResult,
  ): Twig[] {
    const generated =
      (result as any)?.twigs;

    if (!Array.isArray(generated)) {
      return [];
    }

    const allowedFields = new Set([
      'title',
      'executiveSummary',
      'customerProblem',
      'solution',
      'nextSteps',
    ]);

    return generated
      .filter(
        (twig: any) =>
          twig &&
          typeof twig.field ===
            'string' &&
          allowedFields.has(
            twig.field,
          ) &&
          typeof twig.instruction ===
            'string' &&
          twig.instruction.trim(),
      )
      .map(
        (
          twig: any,
          index: number,
        ) => ({
          id:
            typeof twig.id ===
              'string' &&
            twig.id.trim()
              ? twig.id
              : `twig-${String(
                  index + 1,
                ).padStart(
                  3,
                  '0',
                )}`,

          field:
            twig.field as Twig['field'],

          instruction:
            twig.instruction.trim(),

          ...(typeof twig.value ===
          'string'
            ? {
                value:
                  twig.value.trim(),
              }
            : {}),

          required:
            twig.required !== false,

          source:
            'ai-twig-agent',
        }),
      );
  }

  // =====================================================
  // TOP PARTNER
  // =====================================================

  private extractTopPartner(
    result: PartnerResult,
  ): unknown {
    const candidates =
      (result as any)?.candidates;

    if (
      Array.isArray(candidates) &&
      candidates.length > 0
    ) {
      return candidates[0];
    }

    const partners =
      (result as any)?.partners;

    if (
      Array.isArray(partners) &&
      partners.length > 0
    ) {
      return partners[0];
    }

    return null;
  }

  // =====================================================
  // PARTNER NAME
  // =====================================================

  private extractPartnerName(
    partner: unknown,
  ): string | undefined {
    if (
      partner &&
      typeof partner ===
        'object'
    ) {
      const value =
        (partner as any).name;

      if (
        typeof value ===
          'string' &&
        value.trim()
      ) {
        return value;
      }
    }

    return undefined;
  }

  // =====================================================
  // EXTRACT UPDATED PROPOSAL
  // =====================================================

  private extractTwigProposal(
    twigResult: TwigResult,
  ): Record<
    string,
    unknown
  > | null {
    const updated =
      (twigResult as any)?.proposal;

    if (
      updated &&
      typeof updated ===
        'object' &&
      !Array.isArray(updated)
    ) {
      return updated as Record<
        string,
        unknown
      >;
    }

    return null;
  }

  // =====================================================
  // FAILURE HANDLER
  // =====================================================

  private failedRun(
    dealId: string,
    startedAt: string,
    steps: GtmStep[],
    stepName: string,
    error: unknown,
  ) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    this.logger.error(
      `GTM step ${stepName} failed: ${message}`,
    );

    steps.push({
      step: stepName,
      status: 'FAILED',
      startedAt:
        new Date().toISOString(),
      completedAt:
        new Date().toISOString(),
      error: message,
    });

    return {
      runId: randomUUID(),

      dealId,

      status: 'FAILED',

      currentStep: stepName,

      startedAt,

      completedAt:
        new Date().toISOString(),

      steps,

      approval: {
        required: true,
        status: 'NOT_READY',
      },

      error: message,

      message:
        `GTM workflow failed during ${stepName}.`,
    };
  }
}