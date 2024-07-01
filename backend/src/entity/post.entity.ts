import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document } from 'mongoose';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';

@Schema()
export class Post extends Document {
  //title

  @Prop({ required: true })
  title: string;

  //image

  @Prop()
  image: string;

  //body

  @Prop({ required: true })
  body: string;

  //tags
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  tags: Tag[];
  //date

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ required: true })
  titleUrl: string;

  //likes
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  likes: User[];

  //bookmarks
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  bookmarks: User[];

  //unicorns
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  unicorns: User[];

  //comments
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }])
  comments: Comment[];

  //author

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);
