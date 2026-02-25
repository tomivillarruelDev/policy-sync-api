import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdentificationType } from '../modules/person/common/identification/entity/identification-type.entity';

@Injectable()
export class IdentificationSeeder {
  private readonly logger = new Logger(IdentificationSeeder.name);

  constructor(
    @InjectRepository(IdentificationType)
    private readonly identificationTypeRepo: Repository<IdentificationType>,
  ) { }

  async seed() {
    this.logger.log(
      'Iniciando la carga de datos de tipos de identificación...',
    );

    await this.seedIdentificationTypes();

    this.logger.log('Carga de datos de identificación completada con éxito.');
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
      let existingType = await this.identificationTypeRepo.findOne({
        where: { name: type.name },
      });

      if (!existingType) {
        const newType = this.identificationTypeRepo.create(type);
        existingType = await this.identificationTypeRepo.save(newType);
      }

      identificationTypeMap.set(existingType.id, existingType);
    }

    this.logger.log(
      `${identificationTypeMap.size} tipos de identificación verificados/cargados.`,
    );
    return identificationTypeMap;
  }
}
