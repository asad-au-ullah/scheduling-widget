import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsModule } from '../tenants/tenants.module';
import { OAuthModule } from '../oauth/oauth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Appointment } from './appointment.entity';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    TenantsModule,
    OAuthModule,
    NotificationsModule,
  ],
  controllers: [BookingController],
  providers: [BookingRepository, BookingService],
  exports: [BookingService],
})
export class BookingModule {}
