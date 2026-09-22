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

import { PartnersService } from './partners.service.js';
import { CreatePartnerDto } from './dto/create-partner.dto.js';
import { UpdatePartnerDto } from './dto/update-partner.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('partners')
@UseGuards(JwtAuthGuard)
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreatePartnerDto,
  ) {
    return this.partnersService.create(
      req.user.tenantId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.partnersService.findAll(
      req.user.tenantId,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.partnersService.findOne(
      req.user.tenantId,
      id,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(
      req.user.tenantId,
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.partnersService.remove(
      req.user.tenantId,
      id,
    );
  }
}