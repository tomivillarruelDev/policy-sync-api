import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { CliModule } from './cli.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule);
  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.error(error);
    await app.close();
    process.exit(1);
  }
}

void bootstrap();
