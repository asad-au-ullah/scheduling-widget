import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Tenant } from '../features/tenants/tenant.entity';
import { Appointment } from '../features/booking/appointment.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Tenant, Appointment],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true
});
