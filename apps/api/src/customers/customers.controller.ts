import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { RequestWithUser } from '../auth/types/authenticated-user.js';

import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(
      dto,
      req.user.tenantId,
    );
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.customersService.findAll(
      req.user.tenantId,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(
      id,
      req.user.tenantId,
    );
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(
      id,
      dto,
      req.user.tenantId,
    );
  }

  @Delete(':id')
  remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.customersService.remove(
      id,
      req.user.tenantId,
    );
  }
}