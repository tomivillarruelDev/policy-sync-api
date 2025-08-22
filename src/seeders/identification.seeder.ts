import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdentificationType } from 'src/modules/person/common/identification/entity/identification-type.entity';

@Injectable()
export class IdentificationSeeder {
  private readonly logger = new Logger(IdentificationSeeder.name);

  constructor(
    @InjectRepository(IdentificationType)
    private readonly identificationTypeRepo: Repository<IdentificationType>,
  ) {}

  async seed() {
    this.logger.log(
      'Iniciando la carga de datos de tipos de identificación...',
    );

    await this.clearData();

    await this.seedIdentificationTypes();

    this.logger.log('Carga de datos de identificación completada con éxito.');
  }

  async clearData() {
    this.logger.log('Eliminando datos existentes...');
    await this.identificationTypeRepo
      .createQueryBuilder()
      .delete()
      .where('1=1')
      .execute();
    this.logger.log('Datos existentes eliminados.');
  }

  async seedIdentificationTypes(): Promise<Map<string, IdentificationType>> {
    this.logger.log('Cargando tipos de identificación...');
    const identificationTypeMap = new Map<string, IdentificationType>();

    const types = [
      { name: 'DNI', nameEs: 'DNI' },
      { name: 'CUIL', nameEs: 'CUIL' },
      { name: 'CUIT', nameEs: 'CUIT' },
      { name: 'TAX', nameEs: 'TAX' },
      { name: 'RUC', nameEs: 'RUC' },
      { name: 'RFC', nameEs: 'RFC' },
      { name: 'Passport', nameEs: 'Pasaporte' },
      {
        name: 'Health Insurance Affiliate Number',
        nameEs: 'Número de Afiliado Obra Social',
      },
      { name: 'Driver’s License', nameEs: 'Licencia de Conducir' },
      { name: 'Green Card', nameEs: 'Green Card' },
    ];

    for (const type of types) {
      const newType = this.identificationTypeRepo.create(type);
      const saved = await this.identificationTypeRepo.save(newType);
      identificationTypeMap.set(saved.id, saved);
    }

    this.logger.log(
      `${identificationTypeMap.size} tipos de identificación cargados.`,
    );
    return identificationTypeMap;
  }
}
