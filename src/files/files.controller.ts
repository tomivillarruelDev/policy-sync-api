import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterConfigs } from './helpers';
import { CloudinaryService } from './cloudinary.service';

@Controller('files')
export class FilesController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', MulterConfigs.ALL))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.cloudinaryService.uploadImage(file);
  }

  @Get(':publicId')
  getFileByPublicId(@Param('publicId') publicId: string) {
    const fileUrl = this.cloudinaryService.getFileUrl(publicId);
    return { url: fileUrl };
  }

  @Get()
  getStatus() {
    return { status: 'Files service running' };
  }
}
