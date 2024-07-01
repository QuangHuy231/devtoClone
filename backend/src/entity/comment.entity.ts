import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date } from 'mongoose';
import { Post } from './post.entity';
import { User } from './user.entity';

@Schema()
export class Comment {
  @Prop({ required: true })
  body: string;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  //parentPost

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  parentPost: Post;

  //parentId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
  parentId: Comment;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  //likes

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  likes: User[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
