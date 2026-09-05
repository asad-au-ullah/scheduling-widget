import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,
  ) {}

  add(appointment: Appointment) {
    return this.repo.save(appointment);
  }

  getById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(appointment: Appointment) {
    await this.repo.save(appointment);
  }
}
