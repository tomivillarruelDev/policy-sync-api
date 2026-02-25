import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SeederService } from '../../seeder.service';

@Injectable()
export class SuperSeederCommand {
    constructor(private readonly seederService: SeederService) { }

    @Command({
        command: 'seed:super',
        describe:
            'Ejecuta el Super Seeder que genera grandes cantidades de datos aleatorios con Faker',
    })
    async run() {
        await this.seederService.superSeed();
        process.exit(0);
    }
}
