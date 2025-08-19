import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { EnvConfiguration, JoiValidation } from './common/config/';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidation,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('databaseHost'),
        port: configService.get<number>('databasePort'),
        username: configService.get<string>('databaseUsername'),
        password: configService.get<string>('databasePassword'),
        database: configService.get<string>('databaseName'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Solo para desarrollo, usar migraciones en producción
      }),
    }),
    CacheModule.register(),
    CommonModule,
    FilesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
