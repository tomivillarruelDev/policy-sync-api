import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FilesController],
  providers: [FilesService, CloudinaryService],
  imports: [ConfigModule],
})
export class FilesModule {}
