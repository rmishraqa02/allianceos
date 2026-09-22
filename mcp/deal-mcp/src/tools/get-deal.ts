import { z } from 'zod';

import { AllianceOSApiClient } from '../api-client.js';

export const getDealInputSchema = {
  dealId: z
    .string()
    .uuid()
    .describe('AllianceOS Deal ID'),

  token: z
    .string()
    .min(1)
    .describe('AllianceOS JWT access token'),
};

export async function getDeal(
  input: {
    dealId: string;
    token: string;
  },
) {
  const client = new AllianceOSApiClient(input.token);

  return client.get(`/deals/${input.dealId}`);
}
