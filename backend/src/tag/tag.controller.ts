import { Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { AuthGuard } from 'src/auth.guard';

@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  async getAllTags() {
    return await this.tagService.getAllTags();
  }

  @Get('home')
  async getPostsForHomeTags() {
    return await this.tagService.getPostsForHomeTags();
  }

  @Get('/name/:name')
  async getTagByName(@Param('name') name: string) {
    return await this.tagService.getTagByName(name);
  }

  @Get('/:tagId')
  async getTagById(@Param('tagId') tagId: string) {
    return await this.tagService.getTagById(tagId);
  }

  @Get('user/:userId')
  async getTagByUserId(@Param('userId') userId: string) {
    return await this.tagService.getTagByUserId(userId);
  }

  @Put('/follow/:tagId')
  @UseGuards(AuthGuard)
  async followTag(@Param('tagId') tagId: string, @Req() req: any) {
    const userId = req.user.userId;
    return await this.tagService.followTag(tagId, userId);
  }

  @Put('/unfollow/:tagId')
  @UseGuards(AuthGuard)
  async unfollowTag(@Param('tagId') tagId: string, @Req() req: any) {
    const userId = req.user.userId;
    return await this.tagService.unfollowTag(tagId, userId);
  }
}
