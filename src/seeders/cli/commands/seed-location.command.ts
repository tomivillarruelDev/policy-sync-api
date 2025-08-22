import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SeederService } from '../../seeder.service';

@Injectable()
export class SeedLocationCommand {
  constructor(private readonly seederService: SeederService) {}

  @Command({
    command: 'seed:location',
    describe: 'Carga la base de datos con países, estados y ciudades',
  })
  async run() {
    await this.seederService.seed();
    process.exit(0);
  }
}
