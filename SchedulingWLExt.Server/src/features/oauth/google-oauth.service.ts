import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Tenant } from '../tenants/tenant.entity';
import { TenantRepository } from '../tenants/tenant.repository';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

@Injectable()
export class GoogleOAuthService {
  private readonly scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'openid',
    'email',
  ];

  constructor(private readonly tenantRepo: TenantRepository) {}

  buildAuthorizationUrl(tenantSlug: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? '',
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state ?? tenantSlug,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? '',
      grant_type: 'authorization_code',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Google token exchange failed');
    }

    const tokens = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };
  }

  async getValidAccessToken(tenant: Tenant): Promise<string> {
    if (
      tenant.tokenExpiresAt &&
      tenant.googleAccessToken &&
      tenant.tokenExpiresAt.getTime() > Date.now() + 5 * 60 * 1000
    ) {
      return tenant.googleAccessToken;
    }

    if (!tenant.googleRefreshToken) {
      throw new InternalServerErrorException('Tenant has no Google refresh token');
    }

    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: tenant.googleRefreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Google token refresh failed');
    }

    const tokens = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    tenant.googleAccessToken = tokens.access_token;
    tenant.tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await this.tenantRepo.update(tenant);

    return tokens.access_token;
  }
}
