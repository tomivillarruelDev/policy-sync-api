import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedLocationCommand } from './commands/seed-location.command';
import { SeederModule } from '../seeder.module';
import { EnvConfiguration, JoiValidation } from '../../common/config';
import { SeedIdentificationCommand } from './commands/seed-identification.command';
import { VerifyCatalogCommand } from './commands/verify-catalog.command';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // Carga todas las entidades para resolver relaciones en seeders
        entities: [__dirname + '/../../**/*.entity.{ts,js}'],
        autoLoadEntities: false,
        synchronize: true, // ⚠️ solo en desarrollo
      }),
    }),
    SeederModule,
  ],
  providers: [SeedLocationCommand, SeedIdentificationCommand, VerifyCatalogCommand],
})
export class CliModule { }

