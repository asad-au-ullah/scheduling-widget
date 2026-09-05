import { IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';

export class CreateClinicDto {
  @IsString() @IsNotEmpty()
  name!: string;

  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug may only contain lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @IsString() @IsNotEmpty()
  primaryColor!: string;

  @IsString() @IsNotEmpty()
  secondaryColor!: string;

  @IsString() @IsNotEmpty()
  timeZoneId!: string;

  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'workdayStart must be HH:mm or HH:mm:ss' })
  workdayStart!: string;

  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'workdayEnd must be HH:mm or HH:mm:ss' })
  workdayEnd!: string;

  @IsInt() @Min(1)
  slotDurationMinutes!: number;
}
