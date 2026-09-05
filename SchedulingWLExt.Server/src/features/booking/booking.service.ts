import {
  ArgumentMetadata,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tenant } from '../tenants/tenant.entity';
import { TenantRepository } from '../tenants/tenant.repository';
import { GoogleOAuthService } from '../oauth/google-oauth.service';
import { EmailService } from '../notifications/email.service';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { BookingRepository } from './booking.repository';
import { CreateBookingDto } from './dto/create-booking.dto';

const CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

@Injectable()
export class BookingService {
  constructor(
    private readonly tenantRepo: TenantRepository,
    private readonly oauth: GoogleOAuthService,
    private readonly appointmentRepo: BookingRepository,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateBookingDto): Promise<Appointment> {
    const tenant = await this.tenantRepo.getBySlug(dto.tenantSlug);
    if (!tenant) {
      throw new NotFoundException(`Tenant '${dto.tenantSlug}' not found`);
    }

    if (!tenant.googleAccessToken) {
      throw new ConflictException('Clinic has not connected their Google Calendar');
    }

    const slotStart = new Date(dto.slotStart);
    const slotEnd = new Date(dto.slotEnd);

    if (slotStart < new Date()) {
      throw new BadRequestException('Cannot book a slot in the past');
    }

    if (slotEnd <= slotStart) {
      throw new BadRequestException('Slot end must be after slot start');
    }

    const isSlotTaken = await this.isSlotTaken(tenant, slotStart, slotEnd);
    if (isSlotTaken) {
      throw new ConflictException('This slot has already been booked');
    }

    const googleEventId = await this.createGoogleEvent(tenant, dto, slotStart, slotEnd);

    const appointment = this.appointmentRepo.add(
      Object.assign(new Appointment(), {
        tenantId: tenant.id,
        petOwnerName: dto.petOwnerName,
        email: dto.email,
        phone: dto.phone,
        petName: dto.petName,
        reason: dto.reason,
        slotStart,
        slotEnd,
        googleEventId,
        status: AppointmentStatus.Confirmed,
      }),
    );

    const saved = await appointment;

    await this.emailService.sendConfirmation({
      toEmail: dto.email,
      toName: dto.petOwnerName,
      clinicName: tenant.name,
      petName: dto.petName,
      reason: dto.reason,
      slotStart,
      slotEnd,
      timeZoneId: tenant.timeZoneId,
      appointmentId: saved.id,
    });

    return saved;
  }

  async cancel(id: string): Promise<void> {
    const appointment = await this.appointmentRepo.getById(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment '${id}' not found`);
    }

    if (appointment.status === AppointmentStatus.Cancelled) {
      throw new ConflictException('Appointment is already cancelled');
    }

    const tenant = await this.tenantRepo.getById(appointment.tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found for this appointment');
    }

    if (appointment.googleEventId) {
      await this.deleteGoogleEvent(tenant, appointment.googleEventId);
    }

    appointment.status = AppointmentStatus.Cancelled;
    await this.appointmentRepo.update(appointment);

    await this.emailService.sendCancellation({
      toEmail: appointment.email,
      toName: appointment.petOwnerName,
      clinicName: tenant.name,
      petName: appointment.petName,
      slotStart: appointment.slotStart,
      timeZoneId: tenant.timeZoneId,
    });
  }

  private async isSlotTaken(tenant: Tenant, slotStart: Date, slotEnd: Date): Promise<boolean> {
    const accessToken = await this.oauth.getValidAccessToken(tenant);
    const calendarId = encodeURIComponent(tenant.googleCalendarId ?? 'primary');

    const url =
      `${CALENDAR_BASE_URL}/calendars/${calendarId}/events` +
      `?timeMin=${encodeURIComponent(slotStart.toISOString())}` +
      `&timeMax=${encodeURIComponent(slotEnd.toISOString())}` +
      '&singleEvents=true';

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new ConflictException('Unable to check Google Calendar availability');
    }

    const result = (await response.json()) as {
      items?: Array<{ status?: string }>;
    };

    return result.items?.some((event) => event.status !== 'cancelled') ?? false;
  }

  private async createGoogleEvent(
    tenant: Tenant,
    dto: CreateBookingDto,
    slotStart: Date,
    slotEnd: Date,
  ): Promise<string> {
    const accessToken = await this.oauth.getValidAccessToken(tenant);
    const calendarId = encodeURIComponent(tenant.googleCalendarId ?? 'primary');

    const googleEvent = {
      summary: `Appointment: ${dto.petName} (${dto.petOwnerName})`,
      description: `Reason: ${dto.reason}\nOwner: ${dto.petOwnerName}\nPhone: ${dto.phone}`,
      start: { dateTime: slotStart.toISOString(), timeZone: 'UTC' },
      end: { dateTime: slotEnd.toISOString(), timeZone: 'UTC' },
      attendees: [{ email: dto.email, displayName: dto.petOwnerName }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await fetch(
      `${CALENDAR_BASE_URL}/calendars/${calendarId}/events?sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      },
    );

    if (!response.ok) {
      throw new ConflictException('Unable to create Google Calendar event');
    }

    const created = (await response.json()) as { id?: string };
    if (!created.id) {
      throw new ConflictException('Google Calendar returned no event id');
    }

    return created.id;
  }

  private async deleteGoogleEvent(tenant: Tenant, googleEventId: string) {
    const accessToken = await this.oauth.getValidAccessToken(tenant);
    const calendarId = encodeURIComponent(tenant.googleCalendarId ?? 'primary');

    const response = await fetch(
      `${CALENDAR_BASE_URL}/calendars/${calendarId}/events/${encodeURIComponent(googleEventId)}?sendUpdates=all`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok && response.status !== 404) {
      throw new ConflictException('Unable to remove Google Calendar event');
    }
  }
}
