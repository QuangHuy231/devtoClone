import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from 'src/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
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
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.postService.createPost(createPostDto, file, userId);
  }

  @Put('/:postId')
  @UseGuards(AuthGuard)
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
  updatePost(
    @Param('postId') postId: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('titleUrl') titleUrl: string,
    @Body('tags') tags: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    const userId = req.user.userId;
    return this.postService.updatePost(
      postId,
      { title, body, titleUrl },
      file,
      tags,
      userId,
    );
  }

  @Delete('/:postId')
  @UseGuards(AuthGuard)
  deletePost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.deletePost(postId, userId);
  }

  @Get()
  getAllPosts() {
    return this.postService.getAllPosts();
  }

  //Get post user followed
  @Get('/followed')
  @UseGuards(AuthGuard)
  getPostsByUserFollowed(@Req() req: any) {
    const userId = req.user.userId;
    return this.postService.getPostsByUserFollowed(userId);
  }

  @Get('/:postId')
  getPostById(@Param('postId') postId: string) {
    return this.postService.getPostById(postId);
  }

  @Get('/user/:userId')
  getPostByUserId(@Param('userId') userId: string) {
    return this.postService.getPostByUserId(userId);
  }

  @Put('/like/:postId')
  @UseGuards(AuthGuard)
  likePost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.likePost(postId, userId);
  }

  @Put('/unlike/:postId')
  @UseGuards(AuthGuard)
  unlikePost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.unlikePost(postId, userId);
  }

  @Put('/bookmark/:postId')
  @UseGuards(AuthGuard)
  bookmarkPost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.bookmarkPost(postId, userId);
  }

  @Put('/unbookmark/:postId')
  @UseGuards(AuthGuard)
  unbookmarkPost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.unbookmarkPost(postId, userId);
  }

  @Put('/unicorn/:postId')
  @UseGuards(AuthGuard)
  unicornPost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.unicornPost(postId, userId);
  }

  @Put('/ununicorn/:postId')
  @UseGuards(AuthGuard)
  ununicornPost(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.postService.ununicornPost(postId, userId);
  }

  @Get('/search/query')
  searchPost(@Query('search') q: string) {
    return this.postService.getSearchResults(q);
  }

  @Get('/bookmarks/get-bookmarks')
  @UseGuards(AuthGuard)
  getBookmarks(@Req() req: any) {
    const userId = req.user.userId;
    return this.postService.getBookmarks(userId);
  }
}
