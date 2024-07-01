import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadimageService } from './uploadimage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@Controller('upload-image')
export class UploadimageController {
  constructor(private uploadimageService: UploadimageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExt = ['.png', '.jpg', '.jpeg'];
        if (!allowedExt.includes(ext)) {
          req.fileValidationError =
            'Wrong file extension. Only png, jpg and jpeg are allowed';
          return cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 5 * 1024 * 1024) {
            req.fileValidationError = 'File size is too large. Max size is 5MB';
            return cb(null, false);
          } else {
            return cb(null, true);
          }
        }
      },
    }),
  )
  uploadImage(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.uploadimageService.uploadImage(file);
  }
}
