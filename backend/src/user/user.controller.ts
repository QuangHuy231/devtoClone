import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { AuthGuard } from 'src/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/signup')
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('avatar', {
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
  createUser(
    @Req() req,
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.userService.createUser(createUserDto, file);
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('/login-with-github')
  loginWithGithub(@Body('code') code: string) {
    return this.userService.loginWithGithub(code);
  }

  @Get('/:userId')
  getUser(@Param('userId') userId) {
    return this.userService.getUser(userId);
  }

  @Put('/update-user')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
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
  updateUser(
    @Req() req,
    @Body('name') name: string,
    @Body('bio') bio: string,
    @Body('email') email: string,
    @Body('links') links: string,
    @Body('location') location: string,
    @Body('work') work: string,
    @Body('skills') skills: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return this.userService.updateUser(
      name,
      bio,
      email,
      links,
      location,
      work,
      skills,
      file,
      userId,
    );
  }

  @UseGuards(AuthGuard)
  @Put('/follow/:followId')
  followUser(@Req() req, @Param('followId') followId: string) {
    const userId = req.user.userId;
    return this.userService.followUser(userId, followId);
  }

  @UseGuards(AuthGuard)
  @Put('/unfollow/:followId')
  unfollowUser(@Req() req, @Param('followId') followId: string) {
    const userId = req.user.userId;
    return this.userService.unfollowUser(userId, followId);
  }
}
