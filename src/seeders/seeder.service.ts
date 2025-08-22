import { Injectable, Logger } from '@nestjs/common';
import { LocationSeeder } from './location.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly locationSeeder: LocationSeeder) {}

  async seed() {
    try {
      this.logger.log('Iniciando proceso de carga de datos...');
      await this.locationSeeder.seed();
      this.logger.log('¡Datos cargados exitosamente!');
    } catch (error) {
      this.logger.error('Error durante la carga de datos:');
      this.logger.error(error);
    }
  }
}
