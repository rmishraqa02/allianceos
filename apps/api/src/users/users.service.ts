import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateUserDto,
    tenantId: string,
  ) {
    const existingUser =
      await this.prisma.client.orm.public.User
        .where({
          email: dto.email,
          tenantId,
        })
        .first();

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const passwordHash =
      await bcrypt.hash(dto.password, 12);

    const user =
      await this.prisma.client.orm.public.User.create({
        email: dto.email,
        name: dto.name,
        password: passwordHash,
        role: dto.role ?? 'USER',
        tenantId,
      });

    return this.sanitizeUser(user);
  }

  async findAll(tenantId: string) {
    const users =
      await this.prisma.client.orm.public.User
        .where({ tenantId })
        .all();

    return users.map((user) =>
      this.sanitizeUser(user),
    );
  }

  async findOne(
    id: string,
    tenantId: string,
  ) {
    const user =
      await this.prisma.client.orm.public.User
        .where({
          id,
          tenantId,
        })
        .first();

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found`,
      );
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    createdAt: unknown;
    updatedAt: unknown;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}