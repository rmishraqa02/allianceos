import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";

import { GtmService } from "./gtm.service.js";

@Controller("gtm")
export class GtmController {
  constructor(
    private readonly gtmService: GtmService,
  ) {}

  @Post("run")
  async run(
    @Body()
    body: {
      dealId?: string;
      context?: string;
      voiceDump?: string;
    },
    @Req() req: any,
  ) {
    if (!body.dealId) {
      throw new BadRequestException(
        "dealId is required",
      );
    }

    const authorization =
      req.headers?.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        "Authorization header is missing",
      );
    }

    const token =
      authorization.startsWith("Bearer ")
        ? authorization
            .substring(7)
            .trim()
        : "";

    if (!token) {
      throw new UnauthorizedException(
        "Bearer token is missing",
      );
    }

    // Accept either generic GTM context
    // or a voice-dump / meeting context.
    const context =
      body.context ??
      body.voiceDump;

    return this.gtmService.run(
      body.dealId,
      token,
      context,
    );
  }
}