import { Injectable, Logger } from '@nestjs/common';
import { LocationSeeder } from './location.seeder';
import { IdentificationSeeder } from './identification.seeder';
import { CatalogVerificationSeeder } from './catalog-verification.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly locationSeeder: LocationSeeder,
    private readonly identificationSeeder: IdentificationSeeder,
    private readonly catalogVerificationSeeder: CatalogVerificationSeeder,
  ) { }

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

  async verifyCatalog() {
    await this.catalogVerificationSeeder.seed();
  }
}
