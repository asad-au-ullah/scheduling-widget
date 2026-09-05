import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Tenant } from '../tenants/tenant.entity';
import { GoogleOAuthService } from '../oauth/google-oauth.service';

const CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
  id: string;
  summary?: string | null;
  start?: { dateTime?: string | null; date?: string | null };
  end?: { dateTime?: string | null; date?: string | null };
  status?: string | null;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

@Injectable()
export class GoogleCalendarService {
  constructor(private readonly oauth: GoogleOAuthService) {}

  async getEventsForDay(tenant: Tenant, date: string): Promise<CalendarEvent[]> {
    const accessToken = await this.oauth.getValidAccessToken(tenant);
    const calendarId = encodeURIComponent(tenant.googleCalendarId ?? 'primary');

    const timeMin = `${date}T00:00:00.000Z`;
    const timeMax = `${date}T23:59:59.999Z`;

    const url =
      `${CALENDAR_BASE_URL}/calendars/${calendarId}/events` +
      `?timeMin=${encodeURIComponent(timeMin)}` +
      `&timeMax=${encodeURIComponent(timeMax)}` +
      '&singleEvents=true&orderBy=startTime';

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Google Calendar request failed');
    }

    const result = (await response.json()) as { items?: CalendarEvent[] };
    return result.items ?? [];
  }

  computeAvailableSlots(
    tenant: Tenant,
    date: string,
    existingEvents: CalendarEvent[],
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startMinutes = this.toMinutes(tenant.workdayStart);
    const endMinutes = this.toMinutes(tenant.workdayEnd);
    const duration = tenant.slotDurationMinutes;

    for (
      let cursor = startMinutes;
      cursor + duration <= endMinutes;
      cursor += duration
    ) {
      const start = this.utcDate(date, cursor);
      const end = this.utcDate(date, cursor + duration);

      const isBooked = existingEvents.some((event) => {
        if (event.status === 'cancelled') return false;
        const eventStart = event.start?.dateTime
          ? new Date(event.start.dateTime).getTime()
          : Number.NEGATIVE_INFINITY;
        const eventEnd = event.end?.dateTime
          ? new Date(event.end.dateTime).getTime()
          : Number.NEGATIVE_INFINITY;

        return start.getTime() < eventEnd && end.getTime() > eventStart;
      });

      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        available: !isBooked,
      });
    }

    return slots;
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private utcDate(date: string, minutes: number): Date {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return new Date(`${date}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00.000Z`);
  }
}
