import { Body, Controller, Patch, Post, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@ApiTags('Onboarding')
@Controller()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('onboarding')
  async createClinic(@Body() dto: CreateClinicDto) {
    return this.onboardingService.createClinic(dto);
  }

  @Patch('tenants/:slug/settings')
  async updateSettings(
    @Param('slug') slug: string,
    @Body() dto: UpdateClinicSettingsDto,
  ) {
    await this.onboardingService.updateSettings(slug, dto);
    return;
  }
}
