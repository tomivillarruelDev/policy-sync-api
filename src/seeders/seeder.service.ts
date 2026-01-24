import { Injectable, Logger } from '@nestjs/common';
import { LocationSeeder } from './location.seeder';
import { IdentificationSeeder } from './identification.seeder';
import { CatalogVerificationSeeder } from './catalog-verification.seeder';
import { PolicyCategorySeeder } from './policy-category.seeder';
import { PolicyStatusSeeder } from './policy-status.seeder';
import { RelationTypeSeeder } from './relation-type.seeder';
import { VehicleUsageSeeder } from './vehicle-usage.seeder';
import { VehicleTypeSeeder } from './vehicle-type.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly locationSeeder: LocationSeeder,
    private readonly identificationSeeder: IdentificationSeeder,
    private readonly policyCategorySeeder: PolicyCategorySeeder,
    private readonly policyStatusSeeder: PolicyStatusSeeder,
    private readonly relationTypeSeeder: RelationTypeSeeder,
    private readonly vehicleUsageSeeder: VehicleUsageSeeder,
    private readonly vehicleTypeSeeder: VehicleTypeSeeder,
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
    // Seed satellite tables first
    await this.policyCategorySeeder.seed();
    await this.policyStatusSeeder.seed();
    await this.relationTypeSeeder.seed();
    await this.vehicleUsageSeeder.seed();
    await this.vehicleTypeSeeder.seed();

    // Then run catalog verification seeder
    await this.catalogVerificationSeeder.seed();
  }
}
