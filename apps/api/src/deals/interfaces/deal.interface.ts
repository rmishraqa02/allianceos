export type DealStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'CLOSED';

export type DealStage =
  | 'DISCOVERY'
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface Deal {
  id: string;

  name: string;
  description: string | null;

  stage: DealStage;
  status: DealStatus;

  value: number | null;
  currency: string;
  product: string | null;

  partnerRole: string | null;
  expectedCloseDate: string | Date | null;

  tenantId: string;

  partnerId: string | null;
  customerId: string | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Valid Deal lifecycle transitions.
 *
 * DRAFT
 *   -> SUBMITTED
 *
 * SUBMITTED
 *   -> UNDER_REVIEW
 *
 * UNDER_REVIEW
 *   -> APPROVED
 *   -> REJECTED
 *
 * APPROVED
 *   -> IN_PROGRESS
 *
 * IN_PROGRESS
 *   -> CLOSED
 */
export type DealTransition =
  | {
      from: 'DRAFT';
      to: 'SUBMITTED';
    }
  | {
      from: 'SUBMITTED';
      to: 'UNDER_REVIEW';
    }
  | {
      from: 'UNDER_REVIEW';
      to: 'APPROVED' | 'REJECTED';
    }
  | {
      from: 'APPROVED';
      to: 'IN_PROGRESS';
    }
  | {
      from: 'IN_PROGRESS';
      to: 'CLOSED';
    };

/**
 * Deal lifecycle actions exposed by
 * REST API, Deal Agent and Deal MCP.
 */
export type DealAction =
  | 'CREATE'
  | 'UPDATE'
  | 'SUBMIT'
  | 'START_REVIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'START'
  | 'CLOSE'
  | 'DELETE';

/**
 * Standard response for a Deal lifecycle operation.
 */
export interface DealActionResult {
  deal: Deal;
  action: DealAction;
  previousStatus: DealStatus;
  currentStatus: DealStatus;
}

/**
 * Context used by the Deal Agent / MCP layer.
 */
export interface DealContext {
  tenantId: string;
  userId?: string;
  dealId?: string;
  action?: DealAction;
}

/**
 * Deal status summary.
 */
export interface DealStatusSummary {
  dealId: string;
  status: DealStatus;
  stage: DealStage;
  canSubmit: boolean;
  canStartReview: boolean;
  canApprove: boolean;
  canReject: boolean;
  canStart: boolean;
  canClose: boolean;
}