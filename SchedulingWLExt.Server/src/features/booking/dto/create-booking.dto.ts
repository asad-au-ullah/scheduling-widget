import { IsEmail, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  tenantSlug!: string;

  @IsISO8601()
  slotStart!: string;

  @IsISO8601()
  slotEnd!: string;

  @IsString()
  @IsNotEmpty()
  petOwnerName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  petName!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
