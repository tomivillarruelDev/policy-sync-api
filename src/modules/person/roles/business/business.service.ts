import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business } from './entities/business.entity';
import { LegalPerson } from '../../entities/legal-person.entity';
import { handleDBErrors } from '../../../../common/utils/typeorm-errors.util';
import { updatePersonFields } from '../../common/utils/person-update.util';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(LegalPerson)
    private readonly legalRepo: Repository<LegalPerson>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateBusinessDto): Promise<Business> {
    const legal = await this.legalRepo.findOne({
      where: { id: dto.legalPersonId },
    });
    if (!legal) throw new NotFoundException('LegalPerson no encontrada');

    // Opcional: verificar que no exista ya un Business para esa LegalPerson
    const existing = await this.businessRepo.findOne({
      where: { legalPerson: { id: dto.legalPersonId } },
    });
    if (existing)
      throw new ConflictException(
        'Ya existe un Business para esta persona jurídica',
      );

    const entity = this.businessRepo.create({
      legalPerson: legal,
    } as Partial<Business>);
    try {
      return await this.businessRepo.save(entity);
    } catch (e) {
      handleDBErrors(e);
    }
  }

  findAll() {
    return this.businessRepo.find({
      relations: { legalPerson: { person: true } },
    });
  }

  async findOne(id: string) {
    const entity = await this.businessRepo.findOne({
      where: { id },
      relations: { legalPerson: { person: true } },
    });
    if (!entity) throw new NotFoundException('Business no encontrado');
    return entity;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entity = await queryRunner.manager
        .getRepository(Business)
        .findOne({ where: { id }, relations: { legalPerson: true } });
      if (!entity) throw new NotFoundException('Business no encontrado');

      // Cambiar legalPersonId si corresponde
      if (dto.legalPersonId && dto.legalPersonId !== entity.legalPerson?.id) {
        const newLegal = await queryRunner.manager
          .getRepository(LegalPerson)
          .findOne({ where: { id: dto.legalPersonId } });
        if (!newLegal) throw new NotFoundException('LegalPerson no encontrada');

        const exists = await queryRunner.manager
          .getRepository(Business)
          .findOne({ where: { legalPerson: { id: dto.legalPersonId } } });
        if (exists && exists.id !== id) {
          throw new ConflictException(
            'Ya existe un Business para esta persona jurídica',
          );
        }
        entity.legalPerson = newLegal;
      }

      // Update nested LegalPerson fields
      if (dto.legalPerson) {
        // entity.legalPerson is loaded.
        const legalPerson = entity.legalPerson;

        if (dto.legalPerson.organizationName) legalPerson.organizationName = dto.legalPerson.organizationName;
        if (dto.legalPerson.socialReason !== undefined) legalPerson.socialReason = dto.legalPerson.socialReason;
        if (dto.legalPerson.website !== undefined) legalPerson.website = dto.legalPerson.website;

        // Update deeper nested Person fields
        // We use the helper directly
        updatePersonFields(legalPerson.person, dto.legalPerson);

        // Save LegalPerson first (though cascading from Business might work we want to be safe with deeper nests)
        // Actually, since Business -> LegalPerson has NO cascade options defined in Business entity (except maybe generic?),
        // let's check Business entity.
        // Business entity: @OneToOne(() => LegalPerson) without cascade options listed explicitly usually defaults to minimal.
        // Wait, Business entity line 17: @OneToOne(() => LegalPerson, { onDelete: 'CASCADE' })
        // It does NOT have cascade: ['update']. So we MUST save LegalPerson explicitly.

        await queryRunner.manager.getRepository(LegalPerson).save(legalPerson);
      }

      await queryRunner.manager.getRepository(Business).save(entity);

      await queryRunner.commitTransaction();

      // reload con relaciones
      return await this.findOne(id);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      handleDBErrors(e);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const res = await this.businessRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Business no encontrado');
    return { deleted: true };
  }
}
