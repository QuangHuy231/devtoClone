import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/entity/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async getAllNotifications(userId: string): Promise<any> {
    try {
      await this.notificationModel.updateMany(
        { receiver: userId },
        { read: true },
      );
      const notifications = await this.notificationModel
        .find({ receiver: userId })
        .sort({ date: 'desc' })
        .populate('receiver')
        .populate('sender')
        .populate('post')
        .populate('comment', 'body')
        .exec();

      return {
        notifications: notifications.map((notification) =>
          notification.toObject({ getters: true }),
        ),
      };
    } catch (err) {
      throw new HttpException(
        'Could not fetch notifications, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUnreadNotifications(userId: string): Promise<any> {
    try {
      const notifications = await this.notificationModel
        .find({
          receiver: userId,
          read: false,
        })
        .populate('receiver')
        .populate('sender')
        .populate('post')
        .populate('comment', 'body')
        .exec();

      return {
        notifications: notifications.map((notification) =>
          notification.toObject({ getters: true }),
        ),
      };
    } catch (err) {
      throw new HttpException(
        'Could not fetch notifications, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async likeNotification(
    senderId: string,
    postId: string,
    receiverId: string,
  ): Promise<void> {
    try {
      const createdNotification = new this.notificationModel({
        notificationType: 'like',
        sender: senderId,
        receiver: receiverId,
        post: postId,
      });
      await createdNotification.save();
    } catch (err) {
      throw new HttpException(
        'Could not create the like notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeLikeNotification(
    senderId: string,
    postId: string,
    receiverId: string,
  ): Promise<void> {
    try {
      await this.notificationModel.findOneAndDelete({
        receiver: receiverId,
        notificationType: 'like',
        sender: senderId,
        post: postId,
      });
    } catch (err) {
      throw new HttpException(
        'Could not delete the notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async commentNotification(
    senderId: string,
    postId: string,
    commentId: string,
    receiverId: string,
  ): Promise<void> {
    try {
      const createdNotification = new this.notificationModel({
        notificationType: 'comment',
        sender: senderId,
        receiver: receiverId,
        post: postId,
        comment: commentId,
      });
      await createdNotification.save();
    } catch (err) {
      throw new HttpException(
        'Could not create the notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeCommentNotification(
    senderId: string,
    postId: string,
    commentId: string,
    receiverId: string,
  ): Promise<void> {
    try {
      await this.notificationModel.findOneAndDelete({
        receiver: receiverId,
        notificationType: 'comment',
        sender: senderId,
        post: postId,
        comment: commentId,
      });
    } catch (err) {
      throw new HttpException(
        'Could not delete the notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async followNotification(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    try {
      const createdNotification = new this.notificationModel({
        receiver: receiverId,
        notificationType: 'follow',
        sender: senderId,
      });
      await createdNotification.save();
    } catch (err) {
      throw new HttpException(
        'Could not create the notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeFollowNotification(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    try {
      await this.notificationModel
        .findOneAndDelete({
          receiver: receiverId,
          notificationType: 'follow',
          sender: senderId,
        })
        .exec();
    } catch (err) {
      throw new HttpException(
        'Could not delete the notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
