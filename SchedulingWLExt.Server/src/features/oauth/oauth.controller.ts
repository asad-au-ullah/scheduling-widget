import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TenantRepository } from '../tenants/tenant.repository';
import { GoogleOAuthService } from './google-oauth.service';

@ApiTags('OAuth')
@Controller('auth')
export class OAuthController {
  constructor(
    private readonly oauth: GoogleOAuthService,
    private readonly tenantRepo: TenantRepository,
  ) {}

  @Get('connect')
  connect(
    @Query('tenantSlug') tenantSlug: string,
    @Query('returnUrl') returnUrl?: string,
    @Res() res?: Response,
  ) {
    if (!tenantSlug?.trim()) {
      throw new BadRequestException('tenantSlug is required');
    }

    const statePayload = `${tenantSlug}|${returnUrl ?? process.env.DEFAULT_RETURN_URL ?? '/onboard?step=done'}`;
    const state = Buffer.from(statePayload, 'utf8').toString('base64');
    const authUrl = this.oauth.buildAuthorizationUrl(tenantSlug, state);

    return res!.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    if (error) {
      throw new BadRequestException(`Google OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new BadRequestException('Missing code or state');
    }

    let tenantSlug: string;
    let returnUrl: string;

    try {
      const decoded = Buffer.from(state, 'base64').toString('utf8');
      const parts = decoded.split('|');
      tenantSlug = parts[0];
      returnUrl = parts.slice(1).join('|') || process.env.DEFAULT_RETURN_URL || '/onboard?step=done';
    } catch {
      tenantSlug = state;
      returnUrl = process.env.DEFAULT_RETURN_URL || '/onboard?step=done';
    }

    const tenant = await this.tenantRepo.getBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantSlug}' not found`);
    }

    const tokens = await this.oauth.exchangeCode(code);
    tenant.googleAccessToken = tokens.accessToken;
    if (tokens.refreshToken) {
      tenant.googleRefreshToken = tokens.refreshToken;
    }
    tenant.tokenExpiresAt = tokens.expiresAt;
    await this.tenantRepo.update(tenant);

    return res.redirect(returnUrl);
  }
}
