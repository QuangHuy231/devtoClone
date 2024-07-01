import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/auth.guard';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('/:postId')
  async getCommetsByPostId(@Param('postId') postId: string) {
    return await this.commentService.getCommetsByPostId(postId);
  }

  @Post('/create')
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return await this.commentService.createComment(createCommentDto, userId);
  }

  @Put('/update/:commentId')
  @UseGuards(AuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body('body') body: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return await this.commentService.updateComment(commentId, body, userId);
  }

  @Delete('/:commentId')
  @UseGuards(AuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user.userId;
    return await this.commentService.deleteComment(commentId, userId);
  }

  @Put('/like/:commentId')
  @UseGuards(AuthGuard)
  async likeComment(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user.userId;
    return await this.commentService.likeComment(commentId, userId);
  }

  @Put('/unlike/:commentId')
  @UseGuards(AuthGuard)
  async unlikeComment(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user.userId;
    return await this.commentService.unlikeComment(commentId, userId);
  }
}
