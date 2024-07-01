import { Module } from '@nestjs/common';
import { UploadimageController } from './uploadimage.controller';
import { UploadimageService } from './uploadimage.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [UploadimageController],
  providers: [UploadimageService, CloudinaryService],
})
export class UploadimageModule {}
