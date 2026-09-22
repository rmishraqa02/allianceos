import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import type { AuditLogInput } from './interfaces/audit.interface.js';

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async log(input: AuditLogInput) {
    return this.prisma.client.orm.public.AuditLog.create({
      tenantId: input.tenantId,

      actorId: input.actorId ?? null,
      actorType: input.actorType,

      action: input.action,

      entityType: input.entityType,
      entityId: input.entityId,

      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,

      metadata: input.metadata
        ? JSON.stringify(input.metadata)
        : null,

      createdAt: new Date().toISOString(),
    });
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    tenantId: string,
  ) {
    return this.prisma.client.orm.public.AuditLog
      .where({
        entityType,
        entityId,
        tenantId,
      })
      .all();
  }

  async findAll(tenantId: string) {
    return this.prisma.client.orm.public.AuditLog
      .where({ tenantId })
      .all();
  }
}