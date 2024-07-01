import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/entity/post.entity';
import { Model } from 'mongoose';
import { User } from 'src/entity/user.entity';
import { TagService } from 'src/tag/tag.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { NotificationService } from 'src/notification/notification.service';
import { Tag } from 'src/entity/tag.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    @InjectModel('Tag')
    private readonly tagModel: Model<Tag>,
    private tagService: TagService,
    private cloudinaryService: CloudinaryService,
    private notificationService: NotificationService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    try {
      const fileName = await this.cloudinaryService.uploadFile(file);
      const createdPost = new this.postModel({
        title: createPostDto.title,
        body: createPostDto.body,
        titleUrl: createPostDto.titleUrl,
        image: fileName.secure_url,
        author: userId,
      });

      const post = await createdPost.save();
      await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { posts: post } },
      );
      await this.tagService.createTags(
        createPostDto.tags
          .replace('[', '')
          .replace(']', '')
          .replace(/"/g, '')
          .split(','),
        post,
      );
      return (await post.populate('author')).toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not create the post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPosts(): Promise<any> {
    try {
      const posts = await this.postModel
        .find()
        .populate('tags')
        .populate('author')
        .sort({ date: 'desc' });

      return posts.map((post) => post.toObject({ getters: true }));
    } catch (err) {
      throw new HttpException(
        'Could not fetch posts, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //get post by user followed

  async getPostsByUserFollowed(userId: string): Promise<any> {
    //userId is currentUser
    //from userId find followed id-> show post of followed
    const followed = await this.userModel
      .findById(userId)
      .populate('following');

    if (!followed) {
      throw new NotFoundException('Could not find followed');
    }

    const posts = await this.postModel
      .find({ author: { $in: followed.following } })
      .populate('author')
      .populate('tags')
      .sort({ date: 'desc' });

    if (!posts || posts.length === 0) {
      throw new NotFoundException('Could not find posts');
    }

    return posts.map((post) => post.toObject({ getters: true }));
  }

  async getPostById(postId: string): Promise<any> {
    try {
      const post = await this.postModel
        .findById(postId)
        .populate('comments')
        .populate('author')
        .populate('tags');
      if (!post) {
        throw new NotFoundException('Could not find post');
      }
      return post.toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not fetch post, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostByUserId(userId: string): Promise<any> {
    try {
      const posts = await this.postModel
        .find({ author: userId })
        .populate('author')
        .sort({ date: 'desc' })
        .exec();
      if (!posts || posts.length === 0) {
        throw new NotFoundException('Could not find posts');
      }
      return posts.map((post) => post.toObject({ getters: true }));
    } catch (err) {
      throw new HttpException(
        'Could not fetch posts, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePost(
    postId: string,
    { title, body, titleUrl },
    file: Express.Multer.File,
    tags: string,
    userId: string,
  ): Promise<any> {
    try {
      let image;
      const post = await this.postModel.findById(postId).exec();

      if (!post) {
        throw new NotFoundException('Could not find post to update');
      }

      if (post.author.toString() !== userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (file) {
        const fileName = await this.cloudinaryService.uploadFile(file);
        image = fileName.secure_url;
      }
      const updatedPost = await this.postModel
        .findByIdAndUpdate(
          postId,
          { title, body, titleUrl, image },
          { new: true },
        )
        .exec();

      if (!updatedPost) {
        throw new NotFoundException('Could not find post to update');
      }

      await this.tagService.updateTags(
        tags.replace('[', '').replace(']', '').replace(/"/g, '').split(','),
        updatedPost,
      );

      return updatedPost.toObject({ getters: true });
    } catch (error) {
      throw new InternalServerErrorException('Could not update post');
    }
  }

  async deletePost(postId: string, userId: string): Promise<any> {
    try {
      const post = await this.postModel.findById(postId).exec();
      if (!post) {
        throw new NotFoundException('Could not find post');
      }

      if (post.author.toString() !== userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const deletedPost = await this.postModel.findByIdAndDelete(postId).exec();
      if (!deletedPost) {
        throw new NotFoundException('Could not find post');
      }

      await this.userModel
        .updateOne({ _id: userId }, { $pull: { posts: postId } })
        .exec();

      await this.notificationModel.deleteMany({ post: postId }).exec();

      return deletedPost.toObject({ getters: true });
    } catch (error) {
      throw new InternalServerErrorException('Could not delete post');
    }
  }

  async likePost(postId: string, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true },
      );
      if (!post) {
        throw new NotFoundException('Could not find post');
      }

      const authorId = post.author.toString();
      if (authorId !== userId) {
        await this.notificationService.likeNotification(
          userId,
          postId,
          authorId,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not like post');
    }

    return post.toObject({ getters: true });
  }

  async unlikePost(postId: string, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true },
      );
      if (!post) {
        throw new NotFoundException('Could not find post');
      }

      const authorId = post.author.toString();
      if (authorId !== userId) {
        await this.notificationService.removeLikeNotification(
          userId,
          postId,
          authorId,
        );
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not unlike post');
    }

    return post.toObject({ getters: true });
  }

  async bookmarkPost(postId: string, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findByIdAndUpdate(
        postId,
        { $addToSet: { bookmarks: userId } },
        { new: true },
      );
      if (!post) {
        throw new NotFoundException('Could not find post');
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not bookmark post');
    }
    return post.toObject({ getters: true });
  }

  async unbookmarkPost(postId: string, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findByIdAndUpdate(
        postId,
        { $pull: { bookmarks: userId } },
        { new: true },
      );
      if (!post) {
        throw new NotFoundException('Could not find post');
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not unbookmark post');
    }
    return post.toObject({ getters: true });
  }

  async unicornPost(postId: string, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findByIdAndUpdate(
        postId,
        { $addToSet: { unicorns: userId } },
        { new: true },
      );
      if (!post) {
        throw new NotFoundException('Could not find post');
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not unicorn post');
    }
    return post.toObject({ getters: true });
  }

  async ununicornPost(postId: string, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findByIdAndUpdate(
        postId,
        { $pull: { unicorns: userId } },
        { new: true },
      );
      if (!post) {
        throw new NotFoundException('Could not find post');
      }
    } catch (error) {
      throw new InternalServerErrorException('Could not ununicorn post');
    }
    return post.toObject({ getters: true });
  }

  async getSearchResults(searchQuery: string) {
    //search query with title and tags . In tags is object id with repository Tag
    try {
      const posts = await this.postModel
        .find({
          title: { $regex: searchQuery, $options: 'i' },
        })
        .populate('author')
        .populate('tags');
      return { posts: posts.map((post) => post.toObject({ getters: true })) };
    } catch (error) {
      throw new InternalServerErrorException('Could not get search results');
    }
  }

  async getBookmarks(userId: string) {
    try {
      const posts = await this.postModel
        .find({ bookmarks: userId })
        .populate('author')
        .populate('tags');
      return { posts: posts.map((post) => post.toObject({ getters: true })) };
    } catch (err) {
      throw new HttpException('Search failed, please try again', 400);
    }
  }
}
