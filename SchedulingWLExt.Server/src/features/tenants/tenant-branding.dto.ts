export class TenantBrandingDto {
  name!: string;
  logoUrl!: string | null;
  primaryColor!: string;
  secondaryColor!: string;
  timeZone!: string;
  bookingEnabled!: boolean;
  calendarConnected!: boolean;
}
