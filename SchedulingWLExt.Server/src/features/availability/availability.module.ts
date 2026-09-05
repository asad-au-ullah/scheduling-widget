import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { OAuthModule } from '../oauth/oauth.module';
import { AvailabilityController } from './availability.controller';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  imports: [TenantsModule, OAuthModule],
  controllers: [AvailabilityController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class AvailabilityModule {}
