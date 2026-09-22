import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreateApprovalDto } from './dto/create-approval.dto.js';
import { ReviewApprovalDto } from './dto/review-approval.dto.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateApprovalDto,
    tenantId: string,
    userId?: string,
  ) {
    const approval =
      await this.prisma.client.orm.public.ApprovalRequest.create({
        entityType: dto.entityType,
        entityId: dto.entityId,

        status: 'PENDING',

        requestedBy: userId ?? null,
        reviewedBy: null,

        requestedAt: new Date().toISOString(),

        reviewedAt: null,

        comments: dto.comments ?? null,

        tenantId,
      });

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'APPROVAL_REQUESTED',

      entityType: dto.entityType,
      entityId: dto.entityId,

      previousValue: null,
      newValue: 'PENDING',

      metadata: {
        approvalId: approval.id,
        comments: dto.comments ?? null,
      },
    });

    return approval;
  }

  async findAll(tenantId: string) {
    return this.prisma.client.orm.public.ApprovalRequest
      .where({ tenantId })
      .all();
  }

  async findOne(
    id: string,
    tenantId: string,
  ) {
    const approval =
      await this.prisma.client.orm.public.ApprovalRequest
        .where({
          id,
          tenantId,
        })
        .first();

    if (!approval) {
      throw new NotFoundException(
        `Approval request ${id} not found`,
      );
    }

    return approval;
  }

  async approve(
    id: string,
    tenantId: string,
    userId?: string,
    dto?: ReviewApprovalDto,
  ) {
    const approval =
      await this.findOne(id, tenantId);

    this.assertPending(
      approval.status,
      id,
      'approved',
    );

    const reviewedAt =
      new Date().toISOString();

    const comments =
      dto?.comments ??
      approval.comments ??
      null;

    const updatedApproval =
      await this.prisma.client.orm.public.ApprovalRequest
        .where({
          id,
          tenantId,
        })
        .update({
          status: 'APPROVED',

          reviewedBy: userId ?? null,

          reviewedAt,

          comments,
        });

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_APPROVED',

      entityType: approval.entityType,
      entityId: approval.entityId,

      previousValue: 'PENDING',
      newValue: 'APPROVED',

      metadata: {
        approvalId: approval.id,
        comments,
      },
    });

    if (approval.entityType === 'DEAL') {
      await this.updateDealStatus(
        approval.entityId,
        tenantId,
        'APPROVED',
      );
    }

    return updatedApproval;
  }

  async reject(
    id: string,
    tenantId: string,
    userId?: string,
    dto?: ReviewApprovalDto,
  ) {
    const approval =
      await this.findOne(id, tenantId);

    this.assertPending(
      approval.status,
      id,
      'rejected',
    );

    const reviewedAt =
      new Date().toISOString();

    const comments =
      dto?.comments ??
      approval.comments ??
      null;

    const updatedApproval =
      await this.prisma.client.orm.public.ApprovalRequest
        .where({
          id,
          tenantId,
        })
        .update({
          status: 'REJECTED',

          reviewedBy: userId ?? null,

          reviewedAt,

          comments,
        });

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_REJECTED',

      entityType: approval.entityType,
      entityId: approval.entityId,

      previousValue: 'PENDING',
      newValue: 'REJECTED',

      metadata: {
        approvalId: approval.id,
        comments,
      },
    });

    if (approval.entityType === 'DEAL') {
      await this.updateDealStatus(
        approval.entityId,
        tenantId,
        'REJECTED',
      );
    }

    return updatedApproval;
  }

  private assertPending(
    status: string,
    id: string,
    action: string,
  ) {
    if (status !== 'PENDING') {
      throw new BadRequestException(
        `Approval request ${id} cannot be ${action} from status ${status}. Expected PENDING.`,
      );
    }
  }

  private async updateDealStatus(
    dealId: string,
    tenantId: string,
    status:
      | 'APPROVED'
      | 'REJECTED',
  ) {
    const deal =
      await this.prisma.client.orm.public.Deal
        .where({
          id: dealId,
          tenantId,
        })
        .first();

    if (!deal) {
      throw new NotFoundException(
        `Deal ${dealId} not found`,
      );
    }

    return this.prisma.client.orm.public.Deal
      .where({
        id: dealId,
        tenantId,
      })
      .update({
        status,
      });
  }
}