import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date } from 'mongoose';
import { Post } from './post.entity';
import { User } from './user.entity';

@Schema()
export class Tag {
  @Prop({ required: true })
  name: string;
  //date
  @Prop({ type: Date, default: Date.now })
  date: Date;

  //posts
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }])
  posts: Post[];

  //followers
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  followers: User[];
}

export const TagSchema = SchemaFactory.createForClass(Tag);
