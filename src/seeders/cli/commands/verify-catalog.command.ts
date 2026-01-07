import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SeederService } from '../../seeder.service';

@Injectable()
export class VerifyCatalogCommand {
    constructor(private readonly seederService: SeederService) { }

    @Command({
        command: 'verify:catalog',
        describe: 'Verifica la creación de catálogos (Aseguradora, Producto, Plan)',
    })
    async run() {
        await this.seederService.verifyCatalog();
        process.exit(0);
    }
}
