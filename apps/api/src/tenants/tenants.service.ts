import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantDto } from './dto/create-tenant.dto.js';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTenantDto) {
    const existingTenant =
      await this.prisma.client.orm.public.Tenant
        .where({ slug: dto.slug })
        .first();

    if (existingTenant) {
      throw new ConflictException(
        `Tenant with slug ${dto.slug} already exists`,
      );
    }

    return this.prisma.client.orm.public.Tenant.create({
      name: dto.name,
      slug: dto.slug,
    });
  }

  async findAll() {
    return this.prisma.client.orm.public.Tenant.all();
  }

  async findOne(id: string) {
    return this.prisma.client.orm.public.Tenant
      .where({ id })
      .first();
  }
}
