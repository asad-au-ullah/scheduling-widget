import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class UpdateClinicSettingsDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  primaryColor?: string;

  @IsOptional() @IsString()
  secondaryColor?: string;

  @IsOptional() @IsString()
  timeZoneId?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  workdayStart?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  workdayEnd?: string;

  @IsOptional() @IsInt() @Min(1)
  slotDurationMinutes?: number;

  @IsOptional() @IsBoolean()
  bookingEnabled?: boolean;
}
