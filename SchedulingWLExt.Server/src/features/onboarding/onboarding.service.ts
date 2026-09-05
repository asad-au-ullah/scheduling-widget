import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '../tenants/tenant.entity';
import { TenantRepository } from '../tenants/tenant.repository';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly tenantRepo: TenantRepository) { }

  async createClinic(dto: CreateClinicDto) {
    const existing = await this.tenantRepo.getBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(`The slug '${dto.slug}' is already taken`);
    }

    const tenant = Object.assign(new Tenant(), {
      slug: dto.slug,
      name: dto.name,
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      timeZoneId: dto.timeZoneId,
      workdayStart: dto.workdayStart,
      workdayEnd: dto.workdayEnd,
      slotDurationMinutes: dto.slotDurationMinutes,
      bookingEnabled: true,
      logoUrl: null,
      googleCalendarId: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      tokenExpiresAt: null,
    });

    // console.log('before save', tenant)
    
    const saved = await this.tenantRepo.add(tenant);
    
    // console.log('after save', saved)

    return {
      id: saved.id,
      slug: saved.slug,
      name: saved.name,
      bookingUrl: `/${saved.slug}`,
      connectCalendarUrl: `/auth/connect?tenantSlug=${saved.slug}`,
    };
  }

  async updateSettings(slug: string, dto: UpdateClinicSettingsDto) {
    const tenant = await this.tenantRepo.getBySlug(slug);
    if (!tenant) {
      throw new NotFoundException(`Clinic '${slug}' not found`);
    }

    Object.assign(tenant, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.primaryColor !== undefined && { primaryColor: dto.primaryColor }),
      ...(dto.secondaryColor !== undefined && { secondaryColor: dto.secondaryColor }),
      ...(dto.timeZoneId !== undefined && { timeZoneId: dto.timeZoneId }),
      ...(dto.workdayStart !== undefined && { workdayStart: dto.workdayStart }),
      ...(dto.workdayEnd !== undefined && { workdayEnd: dto.workdayEnd }),
      ...(dto.slotDurationMinutes !== undefined && { slotDurationMinutes: dto.slotDurationMinutes }),
      ...(dto.bookingEnabled !== undefined && { bookingEnabled: dto.bookingEnabled }),
    });

    await this.tenantRepo.update(tenant);
  }
}