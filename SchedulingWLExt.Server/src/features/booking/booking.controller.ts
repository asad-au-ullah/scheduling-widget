import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantRepository } from '../tenants/tenant.repository';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Booking')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly tenantRepo: TenantRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreateBookingDto) {
    const appointment = await this.bookingService.create(dto);
    const tenant = await this.tenantRepo.getById(appointment.tenantId);

    return {
      appointmentId: appointment.id,
      clinicName: tenant?.name ?? '',
      slotStart: appointment.slotStart,
      slotEnd: appointment.slotEnd,
      googleEventId: appointment.googleEventId,
      confirmationMessage:
        `Your appointment for ${dto.petName} is confirmed. ` +
        `A calendar invite has been sent to ${dto.email}.`,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    await this.bookingService.cancel(id);

    return {
      appointmentId: id,
      message: 'Appointment cancelled. The calendar invite has been removed.',
    };
  }
}
