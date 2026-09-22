export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type ApprovalEntityType =
  | 'DEAL'
  | 'PARTNER'
  | 'GTM_PROPOSAL'
  | 'CONTRACT'
  | 'CAMPAIGN';

export interface ApprovalRequest {
  id: string;

  entityType: ApprovalEntityType;
  entityId: string;

  status: ApprovalStatus;

  requestedBy: string | null;
  reviewedBy: string | null;

  requestedAt: string | Date;
  reviewedAt: string | Date | null;

  comments: string | null;

  tenantId: string;
}

export interface ApprovalContext {
  tenantId: string;
  userId?: string;
}

export interface ApprovalResult {
  approval: ApprovalRequest;
  previousStatus: ApprovalStatus;
  currentStatus: ApprovalStatus;
  entityType: ApprovalEntityType;
  entityId: string;
}