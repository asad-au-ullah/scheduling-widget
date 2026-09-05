import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AppointmentStatus {
  Confirmed = 0,
  Cancelled = 1,
}

@Entity({ name: 'Appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid', { name: 'Id' })
  id!: string;

  @Index()
  @Column({ name: 'TenantId', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'PetOwnerName', type: 'text' })
  petOwnerName!: string;

  @Column({ name: 'Email', type: 'text' })
  email!: string;

  @Column({ name: 'Phone', type: 'text' })
  phone!: string;

  @Column({ name: 'PetName', type: 'text' })
  petName!: string;

  @Column({ name: 'Reason', type: 'text' })
  reason!: string;

  @Column({ name: 'SlotStart', type: 'timestamptz' })
  slotStart!: Date;

  @Column({ name: 'SlotEnd', type: 'timestamptz' })
  slotEnd!: Date;

  @Column({ name: 'GoogleEventId', type: 'text', nullable: true })
  googleEventId!: string | null;

  @Column({ name: 'Status', type: 'integer', default: AppointmentStatus.Confirmed })
  status!: AppointmentStatus;

  @CreateDateColumn({ name: 'CreatedAt', type: 'timestamptz' })
  createdAt!: Date;
}
