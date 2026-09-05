import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantRepository } from '../tenants/tenant.repository';
import { GoogleCalendarService } from './google-calendar.service';

@ApiTags('Availability')
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly calendarService: GoogleCalendarService,
  ) {}

  @Get()
  async getAvailability(
    @Query('tenantSlug') tenantSlug: string,
    @Query('date') date: string,
  ) {
    if (!tenantSlug || !date) {
      throw new BadRequestException('tenantSlug and date are required');
    }

    const requested = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(requested.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (requested < today) {
      throw new BadRequestException('Cannot query availability for past dates');
    }

    const tenant = await this.tenantRepo.getBySlug(tenantSlug);
    if (!tenant) {
      throw new NotFoundException(`Clinic '${tenantSlug}' not found`);
    }

    if (!tenant.googleAccessToken) {
      throw new ConflictException('This clinic has not connected their Google Calendar yet');
    }

    const events = await this.calendarService.getEventsForDay(tenant, date);
    const activeEvents = events.filter((event) => event.status !== 'cancelled');
    const slots = this.calendarService.computeAvailableSlots(tenant, date, activeEvents);

    return {
      date,
      timeZone: 'UTC',
      slots,
    };
  }
}
