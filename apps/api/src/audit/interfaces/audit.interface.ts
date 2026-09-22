export type AuditActorType =
  | 'USER'
  | 'AGENT'
  | 'SYSTEM';

export interface AuditLogInput {
  tenantId: string;

  actorId?: string | null;
  actorType: AuditActorType;

  action: string;

  entityType: string;
  entityId: string;

  previousValue?: string | null;
  newValue?: string | null;

  metadata?: Record<string, unknown> | null;
}