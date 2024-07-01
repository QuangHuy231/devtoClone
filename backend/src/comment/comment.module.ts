import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { NotificationService } from 'src/notification/notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from 'src/entity/comment.entity';
import { PostSchema } from 'src/entity/post.entity';
import { UserSchema } from 'src/entity/user.entity';
import { NotificationSchema } from 'src/entity/notification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema },
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService, NotificationService],
})
export class CommentModule {}
