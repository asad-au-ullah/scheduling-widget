import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'Slug', type: 'text' })
  slug!: string;

  @Column({ name: 'Name', type: 'text' })
  name!: string;

  @Column({ name: 'LogoUrl', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'PrimaryColor', type: 'text', default: '#2563EB' })
  primaryColor!: string;

  @Column({ name: 'SecondaryColor', type: 'text', default: '#EFF6FF' })
  secondaryColor!: string;

  @Column({ name: 'GoogleCalendarId', type: 'text', nullable: true })
  googleCalendarId!: string | null;

  @Column({ name: 'GoogleAccessToken', type: 'text', nullable: true })
  googleAccessToken!: string | null;

  @Column({ name: 'GoogleRefreshToken', type: 'text', nullable: true })
  googleRefreshToken!: string | null;

  @Column({ name: 'TokenExpiresAt', type: 'timestamptz', nullable: true })
  tokenExpiresAt!: Date | null;

  @Column({ name: 'WorkdayStart', type: 'time' })
  workdayStart!: string;

  @Column({ name: 'WorkdayEnd', type: 'time' })
  workdayEnd!: string;

  @Column({ name: 'SlotDurationMinutes', type: 'integer', default: 30 })
  slotDurationMinutes!: number;

  @Column({ name: 'TimeZoneId', type: 'text', default: 'UTC' })
  timeZoneId!: string;

  @Column({ name: 'BookingEnabled', type: 'boolean', default: true })
  bookingEnabled!: boolean;

  get googleCalendarConnected(): boolean {
    return this.googleAccessToken !== null;
  }
}
