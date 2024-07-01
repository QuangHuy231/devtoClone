import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document } from 'mongoose';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';

@Schema()
export class Notification extends Document {
  //sender
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: User;

  //receiver
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver: User;

  //date
  @Prop({ type: Date, default: Date.now })
  date: Date;
  //post
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: Post;

  //comment
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  comment: Comment;

  @Prop({ type: String, enum: ['like', 'comment', 'follow'] })
  notificationType: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
