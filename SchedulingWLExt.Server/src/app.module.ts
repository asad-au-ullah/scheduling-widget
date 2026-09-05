import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityModule } from './features/availability/availability.module';
import { BookingModule } from './features/booking/booking.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { OAuthModule } from './features/oauth/oauth.module';
import { OnboardingModule } from './features/onboarding/onboarding.module';
import { TenantsModule } from './features/tenants/tenants.module';
import { Tenant } from './features/tenants/tenant.entity';
import { Appointment } from './features/booking/appointment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Tenant, Appointment],
      synchronize: false,
      autoLoadEntities: false,
      logging: false
    }),
    TenantsModule,
    NotificationsModule,
    OAuthModule,
    AvailabilityModule,
    BookingModule,
    OnboardingModule,
  ],
})
export class AppModule {}
