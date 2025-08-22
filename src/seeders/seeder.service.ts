import { Injectable, Logger } from '@nestjs/common';
import { LocationSeeder } from './location.seeder';
import { IdentificationSeeder } from './identification.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly locationSeeder: LocationSeeder,
    private readonly identificationSeeder: IdentificationSeeder,
  ) {}

  async seedLocation() {
    try {
      this.logger.log('Iniciando proceso de carga de datos...');
      await this.locationSeeder.seed();
      this.logger.log('¡Datos cargados exitosamente!');
    } catch (error) {
      this.logger.error('Error durante la carga de datos:');
      this.logger.error(error);
    }
  }

  async seedIdentificationTypes() {
    try {
      this.logger.log('Iniciando proceso de carga de datos...');
      await this.identificationSeeder.seed();
      this.logger.log('¡Datos cargados exitosamente!');
    } catch (error) {
      this.logger.error('Error durante la carga de datos:');
      this.logger.error(error);
    }
  }
}
