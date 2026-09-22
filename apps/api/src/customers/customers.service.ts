import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateCustomerDto,
    tenantId: string,
  ) {
    return this.prisma.client.orm.public.Customer.create({
      name: dto.name,
      company: dto.company ?? null,
      email: dto.email ?? null,
      description: dto.description ?? null,
      tenantId,
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.client.orm.public.Customer
      .where({ tenantId })
      .all();
  }

  async findOne(
    id: string,
    tenantId: string,
  ) {
    const customer =
      await this.prisma.client.orm.public.Customer
        .where({
          id,
          tenantId,
        })
        .first();

    if (!customer) {
      throw new NotFoundException(
        `Customer ${id} not found`,
      );
    }

    return customer;
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    tenantId: string,
  ) {
    await this.findOne(id, tenantId);

    return this.prisma.client.orm.public.Customer
      .where({
        id,
        tenantId,
      })
      .update(dto);
  }

  async remove(
    id: string,
    tenantId: string,
  ) {
    await this.findOne(id, tenantId);

    return this.prisma.client.orm.public.Customer
      .where({
        id,
        tenantId,
      })
      .delete();
  }
}