import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import {
  getDeal,
  getDealInputSchema,
} from './tools/get-deal.js';

import {
  analyzeDeal,
  analyzeDealInputSchema,
} from './tools/analyze-deal.js';

import {
  findPartners,
  findPartnersInputSchema,
} from './tools/find-partners.js';

import {
  generateProposal,
  generateProposalInputSchema,
} from './tools/generate-proposal.js';

import {
  generateTwigs,
  generateTwigsInputSchema,
} from './tools/generate-twigs.js';

import {
  applyTwigs,
  applyTwigsInputSchema,
} from './tools/apply-twigs.js';

import {
  generateEmail,
  generateEmailInputSchema,
} from './tools/generate-email.js';

const server = new McpServer({
  name: 'allianceos-deal-mcp',
  version: '1.0.0',
});

/**
 * =========================================================
 * GET DEAL
 * =========================================================
 */
server.registerTool(
  'get_deal',
  {
    description:
      'Get an AllianceOS deal by its ID.',
    inputSchema: getDealInputSchema,
  },
  async ({ dealId, token }) => {
    try {
      const deal = await getDeal({
        dealId,
        token,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              deal,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * ANALYZE DEAL
 * =========================================================
 */
server.registerTool(
  'analyze_deal',
  {
    description:
      'Analyze an AllianceOS deal and determine the next GTM actions.',
    inputSchema:
      analyzeDealInputSchema,
  },
  async ({ deal }) => {
    try {
      const analysis =
        await analyzeDeal({
          deal,
        });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              analysis,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * FIND PARTNERS
 * =========================================================
 */
server.registerTool(
  'find_partners',
  {
    description:
      'Find and rank suitable AllianceOS partners for a deal.',
    inputSchema:
      findPartnersInputSchema,
  },
  async ({ deal, token }) => {
    try {
      const result =
        await findPartners({
          deal,
          token,
        });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              result,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * GENERATE PROPOSAL
 * =========================================================
 */
server.registerTool(
  'generate_proposal',
  {
    description:
      'Generate a structured GTM proposal from a deal, deal analysis, and selected partner.',
    inputSchema:
      generateProposalInputSchema,
  },
  async ({
    deal,
    analysis,
    partner,
  }) => {
    try {
      const proposal =
        await generateProposal({
          deal,
          analysis,
          partner,
        });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              proposal,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * GENERATE TWIGS
 * =========================================================
 */
server.registerTool(
  'generate_twigs',
  {
    description:
      'Generate controlled GTM modification instructions, called twigs, from the deal, proposal, and business context.',
    inputSchema:
      generateTwigsInputSchema,
  },
  async ({
    deal,
    proposal,
    context,
  }) => {
    try {
      const result =
        await generateTwigs({
          deal,
          proposal,
          context,
        });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              result,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * APPLY TWIGS
 * =========================================================
 */
server.registerTool(
  'apply_twigs',
  {
    description:
      'Apply controlled modifications, called twigs, to an existing GTM proposal.',
    inputSchema:
      applyTwigsInputSchema,
  },
  async ({
    proposal,
    twigs,
  }) => {
    try {
      const result =
        await applyTwigs({
          proposal,
          twigs,
        });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              result,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * GENERATE EMAIL
 * =========================================================
 */
server.registerTool(
  'generate_email',
  {
    description:
      'Generate a GTM outreach email from the deal, final proposal, and applied twigs.',
    inputSchema:
      generateEmailInputSchema,
  },
  async ({
    deal,
    proposal,
    twigs,
    recipientType,
    recipientName,
  }) => {
    try {
      const result =
        await generateEmail({
          deal,
          proposal,
          twigs,
          recipientType,
          recipientName,
        });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              result,
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: message,
          },
        ],
      };
    }
  },
);

/**
 * =========================================================
 * START MCP SERVER
 * =========================================================
 */
const transport =
  new StdioServerTransport();

await server.connect(transport);