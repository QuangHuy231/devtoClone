// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document } from 'mongoose';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { Tag } from './tag.entity';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop()
  bio: string;

  @Prop()
  avatar: string;

  @Prop()
  links: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  joinDate: Date;
  @Prop()
  location: string;

  @Prop()
  work: string;

  @Prop()
  skills: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }])
  posts: Post[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }])
  comments: Comment[];

  // followings

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  followedBy: User[];

  // followers

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  following: User[];

  //followedTags

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  followedTags: Tag[];

  //bookmarks

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }])
  bookmarks: Post[];

  // Các trường khác theo mô hình của bạn
}

export const UserSchema = SchemaFactory.createForClass(User);
