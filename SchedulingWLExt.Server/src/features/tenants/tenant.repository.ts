import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly repo: Repository<Tenant>,
  ) {}

  getBySlug(slug: string) {
    return this.repo
      .createQueryBuilder('tenant')
      .where('LOWER(tenant."Slug") = LOWER(:slug)', { slug })
      .getOne();
  }

  getById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async update(tenant: Tenant) {
    await this.repo.save(tenant);
  }

  async add(tenant: Tenant) {
    return this.repo.save(tenant);
  }
}
