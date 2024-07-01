import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UploadimageService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File) {
    const avatar = await this.cloudinaryService.uploadFile(file);
    return avatar;
  }
}
