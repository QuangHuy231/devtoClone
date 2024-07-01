import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/entity/post.entity';
import { Tag } from 'src/entity/tag.entity';
import { User } from 'src/entity/user.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectModel('Tag') private readonly tagModel: Model<Tag>,
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async createTags(tags: any, post: any): Promise<void> {
    for (const tag of tags) {
      const postTag = await this.tagModel.findOneAndUpdate(
        { name: tag.toLowerCase() },
        { $addToSet: { posts: post._id } },
        { upsert: true, new: true },
      );
      await this.postModel.updateOne(
        { _id: post._id },
        { $addToSet: { tags: postTag._id } },
      );
    }
  }

  async removeTags(tags: any, post: any): Promise<void> {
    //remove all tags
    await this.postModel
      .updateOne({ _id: post._id }, { $set: { tags: [] } })
      .exec();
    for (const tag of tags) {
      await this.tagModel.findOneAndUpdate(
        { name: tag.toLowerCase() },
        { $pull: { posts: post._id } },
        { new: true },
      );
    }
  }

  async updateTags(tags: any, post: any): Promise<void> {
    await this.removeTags(tags, post);
    await this.createTags(tags, post);
  }

  async getAllTags(): Promise<any> {
    const tags = await this.tagModel.find().exec();
    return tags.map((tag) => tag.toObject({ getters: true }));
  }

  async getTagByName(name: string): Promise<any> {
    const tag = await this.tagModel
      .findOne({ name: name.toLowerCase() })
      .populate({
        path: 'posts',
        populate: {
          path: 'tags',
        },
      })
      .populate({
        path: 'posts',
        populate: {
          path: 'author',
        },
      })
      .exec();
    if (!tag) {
      throw new NotFoundException('Could not find tag');
    }
    return tag.toObject({ getters: true });
  }

  async getTagById(tagId: string): Promise<any> {
    const tag = await this.tagModel.findById(tagId).populate('posts').exec();
    if (!tag) {
      throw new NotFoundException('Could not find tag');
    }
    return tag.toObject({ getters: true });
  }

  async getTagByUserId(userId: string): Promise<any> {
    const tags = await this.tagModel.find({ followers: userId }).exec();
    if (!tags || tags.length === 0) {
      throw new NotFoundException('Could not find tags');
    }
    return tags.map((tag) => tag.toObject({ getters: true }));
  }

  async getPostsForHomeTags(): Promise<any> {
    const tags = await this.tagModel
      .find({
        $or: [{ name: 'news' }, { name: 'discuss' }, { name: 'webdev' }],
      })
      .populate('posts')
      .sort({ date: 'desc' })
      .limit(5)
      .exec();

    if (!tags || tags.length === 0) {
      throw new NotFoundException('Could not find tags');
    }
    return tags.map((tag) => tag.toObject({ getters: true }));
  }

  async followTag(tagId: string, userId: string): Promise<any> {
    const tag = await this.tagModel.findByIdAndUpdate(
      tagId,
      { $addToSet: { followers: userId } },
      {
        new: true,
      },
    );

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { followedTags: tagId } },
        {
          new: true,
        },
      )
      .populate('followedTags');

    if (!tag || !user) {
      throw new NotFoundException('Could not follow tag');
    }
    return {
      tag: tag.toObject({ getters: true }),
      user: user.toObject({ getters: true }),
    };
  }

  async unfollowTag(tagId: string, userId: string): Promise<any> {
    const tag = await this.tagModel
      .findByIdAndUpdate(
        tagId,
        { $pull: { followers: userId } },
        {
          new: true,
        },
      )
      .exec();
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { followedTags: tagId } },
        {
          new: true,
        },
      )
      .populate('followedTags')
      .exec();

    if (!tag || !user) {
      throw new NotFoundException('Could not unfollow tag');
    }
    return {
      tag: tag.toObject({ getters: true }),
      user: user.toObject({ getters: true }),
    };
  }
}
