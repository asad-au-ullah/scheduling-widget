import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantRepository } from './tenant.repository';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantRepo: TenantRepository) {}

  @Get(':slug')
  async getTenant(@Param('slug') slug: string) {
    const tenant = await this.tenantRepo.getBySlug(slug);
    if (!tenant) {
      throw new NotFoundException(`Clinic '${slug}' not found`);
    }

    return {
      name: tenant.name,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      timeZone: tenant.timeZoneId,
      bookingEnabled: tenant.bookingEnabled,
      calendarConnected: tenant.googleCalendarConnected,
    };
  }
}
