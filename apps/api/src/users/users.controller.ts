import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { RequestWithUser } from '../auth/types/authenticated-user.js';

import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Roles('ADMIN')
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(
      dto,
      req.user.tenantId,
    );
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.usersService.findAll(
      req.user.tenantId,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(
      id,
      req.user.tenantId,
    );
  }
}