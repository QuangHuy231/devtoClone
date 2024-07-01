import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './notification/notification.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { UploadimageModule } from './uploadimage/uploadimage.module';
import { PostModule } from './post/post.module';
import { TagController } from './tag/tag.controller';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { SocketGateWay } from './socket.gateway';

@Module({
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbName: 'blog',
    }),
    NotificationModule,
    CloudinaryModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UploadimageModule,
    PostModule,
    TagModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateWay],
})
export class AppModule {}
