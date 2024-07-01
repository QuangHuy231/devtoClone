import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from 'src/entity/tag.entity';
import { PostSchema } from 'src/entity/post.entity';
import { UserSchema } from 'src/entity/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tag', schema: TagSchema },
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
