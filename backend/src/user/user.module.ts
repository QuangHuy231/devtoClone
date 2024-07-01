import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationSchema } from 'src/entity/notification.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: 'secret',
    }),
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService, NotificationService, CloudinaryService],
})
export class UserModule {}
