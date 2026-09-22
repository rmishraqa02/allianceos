import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ApprovalsService } from '../approvals/approvals.service.js';
import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvalsService: ApprovalsService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateDealDto,
    tenantId: string,
    userId?: string,
  ) {
    const deal =
      await this.prisma.client.orm.public.Deal.create({
        name: dto.name,

        description:
          dto.description ?? null,

        stage:
          dto.stage ?? 'DISCOVERY',

        status: 'DRAFT',

        value:
          dto.value ?? null,

        currency:
          dto.currency ?? 'USD',

        product:
          dto.product ?? null,

        partnerRole:
          dto.partnerRole ?? null,

        expectedCloseDate:
          dto.expectedCloseDate ?? null,

        tenantId,

        partnerId:
          dto.partnerId ?? null,

        customerId:
          dto.customerId ?? null,
      });

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_CREATED',

      entityType: 'DEAL',
      entityId: deal.id,

      previousValue: null,
      newValue: 'DRAFT',

      metadata: {
        dealName: deal.name,
      },
    });

    return deal;
  }

  async findAll(tenantId: string) {
    return this.prisma.client.orm.public.Deal
      .where({ tenantId })
      .all();
  }

  async findOne(
    id: string,
    tenantId: string,
  ) {
    const deal =
      await this.prisma.client.orm.public.Deal
        .where({
          id,
          tenantId,
        })
        .first();

    if (!deal) {
      throw new NotFoundException(
        `Deal ${id} not found`,
      );
    }

    return deal;
  }

  async update(
    id: string,
    dto: UpdateDealDto,
    tenantId: string,
    userId?: string,
  ) {
    const existingDeal =
      await this.findOne(
        id,
        tenantId,
      );

    const updatedDeal =
      await this.prisma.client.orm.public.Deal
        .where({
          id,
          tenantId,
        })
        .update(dto);

    if (!updatedDeal) {
      throw new NotFoundException(
        `Deal ${id} could not be updated`,
      );
    }

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_UPDATED',

      entityType: 'DEAL',
      entityId: id,

      previousValue:
        JSON.stringify({
          name: existingDeal.name,
          stage: existingDeal.stage,
          value: existingDeal.value,
          currency:
            existingDeal.currency,
          product:
            existingDeal.product,
          partnerRole:
            existingDeal.partnerRole,
          expectedCloseDate:
            existingDeal.expectedCloseDate,
        }),

      newValue:
        JSON.stringify({
          name: updatedDeal.name,
          stage: updatedDeal.stage,
          value: updatedDeal.value,
          currency:
            updatedDeal.currency,
          product:
            updatedDeal.product,
          partnerRole:
            updatedDeal.partnerRole,
          expectedCloseDate:
            updatedDeal.expectedCloseDate,
        }),
    });

    return updatedDeal;
  }

  async remove(
    id: string,
    tenantId: string,
    userId?: string,
  ) {
    const deal =
      await this.findOne(
        id,
        tenantId,
      );

    const deletedDeal =
      await this.prisma.client.orm.public.Deal
        .where({
          id,
          tenantId,
        })
        .delete();

    if (!deletedDeal) {
      throw new NotFoundException(
        `Deal ${id} could not be deleted`,
      );
    }

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_DELETED',

      entityType: 'DEAL',
      entityId: id,

      previousValue:
        deal.status,

      newValue: null,

      metadata: {
        dealName: deal.name,
      },
    });

    return deletedDeal;
  }

  async submit(
    id: string,
    tenantId: string,
    userId?: string,
  ) {
    const deal =
      await this.findOne(
        id,
        tenantId,
      );

    this.assertStatus(
      deal.status,
      'DRAFT',
      id,
      'submitted',
    );

    const updatedDeal =
      await this.transition(
        id,
        tenantId,
        'SUBMITTED',
      );

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_SUBMITTED',

      entityType: 'DEAL',
      entityId: id,

      previousValue: 'DRAFT',
      newValue: 'SUBMITTED',
    });

    return updatedDeal;
  }

  async startReview(
    id: string,
    tenantId: string,
    userId?: string,
  ) {
    const deal =
      await this.findOne(
        id,
        tenantId,
      );

    this.assertStatus(
      deal.status,
      'SUBMITTED',
      id,
      'enter review',
    );

    const updatedDeal =
      await this.transition(
        id,
        tenantId,
        'UNDER_REVIEW',
      );

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_UNDER_REVIEW',

      entityType: 'DEAL',
      entityId: id,

      previousValue: 'SUBMITTED',
      newValue: 'UNDER_REVIEW',
    });

    await this.approvalsService.create(
      {
        entityType: 'DEAL',
        entityId: id,
        comments:
          `Approval requested for deal ${deal.name}`,
      },
      tenantId,
      userId,
    );

    return updatedDeal;
  }

  async start(
    id: string,
    tenantId: string,
    userId?: string,
  ) {
    const deal =
      await this.findOne(
        id,
        tenantId,
      );

    this.assertStatus(
      deal.status,
      'APPROVED',
      id,
      'started',
    );

    const updatedDeal =
      await this.transition(
        id,
        tenantId,
        'IN_PROGRESS',
      );

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_STARTED',

      entityType: 'DEAL',
      entityId: id,

      previousValue: 'APPROVED',
      newValue: 'IN_PROGRESS',
    });

    return updatedDeal;
  }

  async close(
    id: string,
    tenantId: string,
    userId?: string,
  ) {
    const deal =
      await this.findOne(
        id,
        tenantId,
      );

    this.assertStatus(
      deal.status,
      'IN_PROGRESS',
      id,
      'closed',
    );

    const updatedDeal =
      await this.transition(
        id,
        tenantId,
        'CLOSED',
      );

    await this.auditService.log({
      tenantId,

      actorId: userId ?? null,
      actorType: userId ? 'USER' : 'SYSTEM',

      action: 'DEAL_CLOSED',

      entityType: 'DEAL',
      entityId: id,

      previousValue:
        'IN_PROGRESS',

      newValue:
        'CLOSED',
    });

    return updatedDeal;
  }

  private assertStatus(
    currentStatus: string,
    expectedStatus: string,
    id: string,
    action: string,
  ) {
    if (
      currentStatus !==
      expectedStatus
    ) {
      throw new BadRequestException(
        `Deal ${id} cannot be ${action} from status ${currentStatus}. Expected ${expectedStatus}.`,
      );
    }
  }

  private async transition(
    id: string,
    tenantId: string,
    status:
      | 'SUBMITTED'
      | 'UNDER_REVIEW'
      | 'APPROVED'
      | 'REJECTED'
      | 'IN_PROGRESS'
      | 'CLOSED',
  ) {
    const updatedDeal =
      await this.prisma.client.orm.public.Deal
        .where({
          id,
          tenantId,
        })
        .update({
          status,
        });

    if (!updatedDeal) {
      throw new NotFoundException(
        `Deal ${id} could not be transitioned to ${status}`,
      );
    }

    return updatedDeal;
  }
}