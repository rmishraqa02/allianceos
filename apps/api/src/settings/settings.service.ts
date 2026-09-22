import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateConfigDto } from './dto/create-config.dto.js';
import { UpdateConfigDto } from './dto/update-config.dto.js';

export type ConfigType =
  | 'partner-types'
  | 'partner-tiers'
  | 'partner-statuses'
  | 'industries'
  | 'regions'
  | 'capabilities';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    tenantId: string,
    type: ConfigType,
  ) {
    switch (type) {
      case 'partner-types':
        return this.prisma.client.orm.public.PartnerType
          .where({ tenantId })
          .all();

      case 'partner-tiers':
        return this.prisma.client.orm.public.PartnerTier
          .where({ tenantId })
          .all();

      case 'partner-statuses':
        return this.prisma.client.orm.public.PartnerStatus
          .where({ tenantId })
          .all();

      case 'industries':
        return this.prisma.client.orm.public.Industry
          .where({ tenantId })
          .all();

      case 'regions':
        return this.prisma.client.orm.public.Region
          .where({ tenantId })
          .all();

      case 'capabilities':
        return this.prisma.client.orm.public.Capability
          .where({ tenantId })
          .all();

      default:
        throw new BadRequestException(
          `Unsupported configuration type: ${type}`,
        );
    }
  }

  async create(
    tenantId: string,
    type: ConfigType,
    dto: CreateConfigDto,
  ) {
    switch (type) {
      case 'partner-types':
        return this.createPartnerType(tenantId, dto);

      case 'partner-tiers':
        return this.createPartnerTier(tenantId, dto);

      case 'partner-statuses':
        return this.createPartnerStatus(tenantId, dto);

      case 'industries':
        return this.createIndustry(tenantId, dto);

      case 'regions':
        return this.createRegion(tenantId, dto);

      case 'capabilities':
        return this.createCapability(tenantId, dto);

      default:
        throw new BadRequestException(
          `Unsupported configuration type: ${type}`,
        );
    }
  }

  private async createPartnerType(
    tenantId: string,
    dto: CreateConfigDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.PartnerType
        .where({
          tenantId,
          name: dto.name,
        })
        .first();

    if (existing) {
      throw new BadRequestException(
        `${dto.name} already exists`,
      );
    }

    return this.prisma.client.orm.public.PartnerType.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      tenantId,
    });
  }

  private async createPartnerTier(
    tenantId: string,
    dto: CreateConfigDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.PartnerTier
        .where({
          tenantId,
          name: dto.name,
        })
        .first();

    if (existing) {
      throw new BadRequestException(
        `${dto.name} already exists`,
      );
    }

    return this.prisma.client.orm.public.PartnerTier.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      tenantId,
    });
  }

  private async createPartnerStatus(
    tenantId: string,
    dto: CreateConfigDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.PartnerStatus
        .where({
          tenantId,
          name: dto.name,
        })
        .first();

    if (existing) {
      throw new BadRequestException(
        `${dto.name} already exists`,
      );
    }

    return this.prisma.client.orm.public.PartnerStatus.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      tenantId,
    });
  }

  private async createIndustry(
    tenantId: string,
    dto: CreateConfigDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.Industry
        .where({
          tenantId,
          name: dto.name,
        })
        .first();

    if (existing) {
      throw new BadRequestException(
        `${dto.name} already exists`,
      );
    }

    return this.prisma.client.orm.public.Industry.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      tenantId,
    });
  }

  private async createRegion(
    tenantId: string,
    dto: CreateConfigDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.Region
        .where({
          tenantId,
          name: dto.name,
        })
        .first();

    if (existing) {
      throw new BadRequestException(
        `${dto.name} already exists`,
      );
    }

    return this.prisma.client.orm.public.Region.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      tenantId,
    });
  }

  private async createCapability(
    tenantId: string,
    dto: CreateConfigDto,
  ) {
    const existing =
      await this.prisma.client.orm.public.Capability
        .where({
          tenantId,
          name: dto.name,
        })
        .first();

    if (existing) {
      throw new BadRequestException(
        `${dto.name} already exists`,
      );
    }

    return this.prisma.client.orm.public.Capability.create({
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
      tenantId,
    });
  }

  async update(
    tenantId: string,
    type: ConfigType,
    id: string,
    dto: UpdateConfigDto,
  ) {
    switch (type) {
      case 'partner-types':
        return this.updatePartnerType(
          tenantId,
          id,
          dto,
        );

      case 'partner-tiers':
        return this.updatePartnerTier(
          tenantId,
          id,
          dto,
        );

      case 'partner-statuses':
        return this.updatePartnerStatus(
          tenantId,
          id,
          dto,
        );

      case 'industries':
        return this.updateIndustry(
          tenantId,
          id,
          dto,
        );

      case 'regions':
        return this.updateRegion(
          tenantId,
          id,
          dto,
        );

      case 'capabilities':
        return this.updateCapability(
          tenantId,
          id,
          dto,
        );

      default:
        throw new BadRequestException(
          `Unsupported configuration type: ${type}`,
        );
    }
  }

  private async updatePartnerType(
    tenantId: string,
    id: string,
    dto: UpdateConfigDto,
  ) {
    const item =
      await this.prisma.client.orm.public.PartnerType
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.PartnerType
      .where({ id, tenantId })
      .update(dto);
  }

  private async updatePartnerTier(
    tenantId: string,
    id: string,
    dto: UpdateConfigDto,
  ) {
    const item =
      await this.prisma.client.orm.public.PartnerTier
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.PartnerTier
      .where({ id, tenantId })
      .update(dto);
  }

  private async updatePartnerStatus(
    tenantId: string,
    id: string,
    dto: UpdateConfigDto,
  ) {
    const item =
      await this.prisma.client.orm.public.PartnerStatus
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.PartnerStatus
      .where({ id, tenantId })
      .update(dto);
  }

  private async updateIndustry(
    tenantId: string,
    id: string,
    dto: UpdateConfigDto,
  ) {
    const item =
      await this.prisma.client.orm.public.Industry
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.Industry
      .where({ id, tenantId })
      .update(dto);
  }

  private async updateRegion(
    tenantId: string,
    id: string,
    dto: UpdateConfigDto,
  ) {
    const item =
      await this.prisma.client.orm.public.Region
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.Region
      .where({ id, tenantId })
      .update(dto);
  }

  private async updateCapability(
    tenantId: string,
    id: string,
    dto: UpdateConfigDto,
  ) {
    const item =
      await this.prisma.client.orm.public.Capability
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.Capability
      .where({ id, tenantId })
      .update(dto);
  }

  async remove(
    tenantId: string,
    type: ConfigType,
    id: string,
  ) {
    switch (type) {
      case 'partner-types':
        return this.deletePartnerType(tenantId, id);

      case 'partner-tiers':
        return this.deletePartnerTier(tenantId, id);

      case 'partner-statuses':
        return this.deletePartnerStatus(tenantId, id);

      case 'industries':
        return this.deleteIndustry(tenantId, id);

      case 'regions':
        return this.deleteRegion(tenantId, id);

      case 'capabilities':
        return this.deleteCapability(tenantId, id);

      default:
        throw new BadRequestException(
          `Unsupported configuration type: ${type}`,
        );
    }
  }

  private async deletePartnerType(
    tenantId: string,
    id: string,
  ) {
    const item =
      await this.prisma.client.orm.public.PartnerType
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.PartnerType
      .where({ id, tenantId })
      .delete();
  }

  private async deletePartnerTier(
    tenantId: string,
    id: string,
  ) {
    const item =
      await this.prisma.client.orm.public.PartnerTier
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.PartnerTier
      .where({ id, tenantId })
      .delete();
  }

  private async deletePartnerStatus(
    tenantId: string,
    id: string,
  ) {
    const item =
      await this.prisma.client.orm.public.PartnerStatus
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.PartnerStatus
      .where({ id, tenantId })
      .delete();
  }

  private async deleteIndustry(
    tenantId: string,
    id: string,
  ) {
    const item =
      await this.prisma.client.orm.public.Industry
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.Industry
      .where({ id, tenantId })
      .delete();
  }

  private async deleteRegion(
    tenantId: string,
    id: string,
  ) {
    const item =
      await this.prisma.client.orm.public.Region
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.Region
      .where({ id, tenantId })
      .delete();
  }

  private async deleteCapability(
    tenantId: string,
    id: string,
  ) {
    const item =
      await this.prisma.client.orm.public.Capability
        .where({ id, tenantId })
        .first();

    if (!item) {
      throw new NotFoundException(
        'Configuration item not found',
      );
    }

    return this.prisma.client.orm.public.Capability
      .where({ id, tenantId })
      .delete();
  }
}