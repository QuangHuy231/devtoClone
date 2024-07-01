import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from 'src/entity/post.entity';
import { UserSchema } from 'src/entity/user.entity';
import { TagService } from 'src/tag/tag.service';
import { TagSchema } from 'src/entity/tag.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationSchema } from 'src/entity/notification.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Tag', schema: TagSchema },
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService, TagService, CloudinaryService, NotificationService],
})
export class PostModule {}
