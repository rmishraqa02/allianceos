import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreatePartnerDto } from './dto/create-partner.dto.js';
import { UpdatePartnerDto } from './dto/update-partner.dto.js';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    tenantId: string,
    dto: CreatePartnerDto,
  ) {
    await this.validateConfiguration(
      tenantId,
      dto.partnerTypeId,
      dto.tierId,
      dto.statusId,
      dto.industryId,
      dto.regionId,
      dto.capabilityIds,
    );

    const partner =
      await this.prisma.client.orm.public.Partner.create({
        name: dto.name,
        description: dto.description ?? null,
        website: dto.website ?? null,

        // Legacy field retained for backward compatibility.
        status: 'ACTIVE',

        tenantId,

        partnerTypeId:
          dto.partnerTypeId ?? null,

        tierId:
          dto.tierId ?? null,

        statusId:
          dto.statusId ?? null,

        industryId:
          dto.industryId ?? null,

        regionId:
          dto.regionId ?? null,
      });

    if (
      dto.capabilityIds &&
      dto.capabilityIds.length > 0
    ) {
      await this.createCapabilityLinks(
        partner.id,
        dto.capabilityIds,
      );
    }

    return this.findOne(
      tenantId,
      partner.id,
    );
  }

  async findAll(tenantId: string) {
    return this.prisma.client.orm.public.Partner
      .where({ tenantId })
      .all();
  }

  async findOne(
    tenantId: string,
    id: string,
  ) {
    const partner =
      await this.prisma.client.orm.public.Partner
        .where({
          id,
          tenantId,
        })
        .first();

    if (!partner) {
      throw new NotFoundException(
        'Partner not found.',
      );
    }

    const capabilities =
      await this.prisma.client.orm.public.PartnerCapability
        .where({
          partnerId: id,
        })
        .all();

    return {
      ...partner,
      capabilityIds:
        capabilities.map(
          (item) => item.capabilityId,
        ),
    };
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePartnerDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.Partner
        .where({
          id,
          tenantId,
        })
        .first();

    if (!existing) {
      throw new NotFoundException(
        'Partner not found.',
      );
    }

    await this.validateConfiguration(
      tenantId,
      dto.partnerTypeId,
      dto.tierId,
      dto.statusId,
      dto.industryId,
      dto.regionId,
      dto.capabilityIds,
    );

    const updateData: Record<
      string,
      unknown
    > = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description =
        dto.description;
    }

    if (dto.website !== undefined) {
      updateData.website =
        dto.website;
    }

    if (dto.partnerTypeId !== undefined) {
      updateData.partnerTypeId =
        dto.partnerTypeId;
    }

    if (dto.tierId !== undefined) {
      updateData.tierId =
        dto.tierId;
    }

    if (dto.statusId !== undefined) {
      updateData.statusId =
        dto.statusId;
    }

    if (dto.industryId !== undefined) {
      updateData.industryId =
        dto.industryId;
    }

    if (dto.regionId !== undefined) {
      updateData.regionId =
        dto.regionId;
    }

    if (
      Object.keys(updateData).length > 0
    ) {
      await this.prisma.client.orm.public.Partner
        .where({
          id,
          tenantId,
        })
        .update(updateData);
    }

    if (dto.capabilityIds !== undefined) {
      await this.replaceCapabilities(
        tenantId,
        id,
        dto.capabilityIds,
      );
    }

    return this.findOne(
      tenantId,
      id,
    );
  }

  async remove(
    tenantId: string,
    id: string,
  ) {
    const existing =
      await this.prisma.client.orm.public.Partner
        .where({
          id,
          tenantId,
        })
        .first();

    if (!existing) {
      throw new NotFoundException(
        'Partner not found.',
      );
    }

    await this.prisma.client.orm.public.Partner
      .where({
        id,
        tenantId,
      })
      .delete();

    return {
      success: true,
      message: 'Partner deleted successfully.',
    };
  }

  private async validateConfiguration(
    tenantId: string,
    partnerTypeId?: string | null,
    tierId?: string | null,
    statusId?: string | null,
    industryId?: string | null,
    regionId?: string | null,
    capabilityIds?: string[],
  ) {
    if (partnerTypeId) {
      const item =
        await this.prisma.client.orm.public.PartnerType
          .where({
            id: partnerTypeId,
            tenantId,
          })
          .first();

      if (!item) {
        throw new BadRequestException(
          'Invalid partner type.',
        );
      }
    }

    if (tierId) {
      const item =
        await this.prisma.client.orm.public.PartnerTier
          .where({
            id: tierId,
            tenantId,
          })
          .first();

      if (!item) {
        throw new BadRequestException(
          'Invalid partner tier.',
        );
      }
    }

    if (statusId) {
      const item =
        await this.prisma.client.orm.public.PartnerStatus
          .where({
            id: statusId,
            tenantId,
          })
          .first();

      if (!item) {
        throw new BadRequestException(
          'Invalid partner status.',
        );
      }
    }

    if (industryId) {
      const item =
        await this.prisma.client.orm.public.Industry
          .where({
            id: industryId,
            tenantId,
          })
          .first();

      if (!item) {
        throw new BadRequestException(
          'Invalid industry.',
        );
      }
    }

    if (regionId) {
      const item =
        await this.prisma.client.orm.public.Region
          .where({
            id: regionId,
            tenantId,
          })
          .first();

      if (!item) {
        throw new BadRequestException(
          'Invalid region.',
        );
      }
    }

    if (
      capabilityIds &&
      capabilityIds.length > 0
    ) {
      const uniqueIds = [
        ...new Set(capabilityIds),
      ];

      for (const capabilityId of uniqueIds) {
        const capability =
          await this.prisma.client.orm.public.Capability
            .where({
              id: capabilityId,
              tenantId,
            })
            .first();

        if (!capability) {
          throw new BadRequestException(
            `Invalid capability: ${capabilityId}`,
          );
        }
      }
    }
  }

  private async createCapabilityLinks(
    partnerId: string,
    capabilityIds: string[],
  ) {
    const uniqueIds = [
      ...new Set(capabilityIds),
    ];

    for (const capabilityId of uniqueIds) {
      await this.prisma.client.orm.public.PartnerCapability.create(
        {
          partnerId,
          capabilityId,
        },
      );
    }
  }

 private async replaceCapabilities(
  tenantId: string,
  partnerId: string,
  capabilityIds: string[],
) {
  const existingLinks =
    await this.prisma.client.orm.public.PartnerCapability
      .where({
        partnerId,
      })
      .all();

  for (const link of existingLinks) {
    await this.prisma.client.orm.public.PartnerCapability
      .where({
        partnerId: link.partnerId,
        capabilityId: link.capabilityId,
      })
      .delete();
  }

  if (capabilityIds.length === 0) {
    return;
  }

  await this.createCapabilityLinks(
    partnerId,
    [...new Set(capabilityIds)],
  );
}
}