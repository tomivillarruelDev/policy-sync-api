import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SeederService } from '../../seeder.service';

@Injectable()
export class SeedIdentificationCommand {
  constructor(private readonly seederService: SeederService) {}

  @Command({
    command: 'seed:identification',
    describe: 'Carga la base de datos con tipos de identificación',
  })
  async run() {
    await this.seederService.seedIdentificationTypes();
    process.exit(0);
  }
}
