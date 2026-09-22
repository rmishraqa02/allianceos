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

import { CreateDealDto } from './dto/create-deal.dto.js';
import { UpdateDealDto } from './dto/update-deal.dto.js';
import { DealsService } from './deals.service.js';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(
    private readonly dealsService: DealsService,
  ) {}

  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDealDto,
  ) {
    return this.dealsService.create(
      dto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.dealsService.findAll(
      req.user.tenantId,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.dealsService.findOne(
      id,
      req.user.tenantId,
    );
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealsService.update(
      id,
      dto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.dealsService.remove(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Post(':id/submit')
  submit(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.dealsService.submit(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Post(':id/review')
  startReview(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.dealsService.startReview(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Post(':id/start')
  start(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.dealsService.start(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Post(':id/close')
  close(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.dealsService.close(
      id,
      req.user.tenantId,
      req.user.userId,
    );
  }
}